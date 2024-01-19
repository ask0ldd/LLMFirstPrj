/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import { useRef, useState } from 'react'
import DialogBlockFactory from './assets/services/DialogBlockFactory';
import { ChatService } from './services/ChatService';
import useAutoScrollToLastItem from './hooks/useAutoScrollToLastItem';
import useHistoryNavigator from './hooks/useHistoryNavigator';

function App() {
  const decoder = new TextDecoder('utf-8');

  const streamedLetterPos = useRef(0)
  const isStreaming = useRef(false)
  const addLetterIntervalId = useRef<NodeJS.Timeout | null>(null)
  
  const [streamedDatas, _setStreamedDatas] = useState<string>("")
  const streamedDatasRef = useRef('')
  function setStreamedDatas(chunk : string){
    _setStreamedDatas(data => data + chunk)
    streamedDatasRef.current += chunk
  }
  function resetStreamedDatas(){
    _setStreamedDatas("")
    streamedDatasRef.current = ""
    streamedLetterPos.current = 0
    addLetterIntervalId.current = null
  }

  // Q & A History + Autoscroll feature
  const [history, setHistory] = useState<IHistory[]>([])
  const autoScrollHistoryRef = useAutoScrollToLastItem()
  const {getNextQuestion, getPreviousQuestion} = useHistoryNavigator(history)

  async function handleClick(){

    // href the element?
    const inputValue = (document.getElementById('userMessage') as HTMLTextAreaElement).value
    if(inputValue == null) return

    if(isStreaming.current) return
    isStreaming.current = true
    
    resetStreamedDatas()
    
    setHistory(history => {
      const newHistory = [...history]
      newHistory.push({type : "question", text : inputValue})
      return newHistory
    })

    const response = await ChatService.postQuestion(inputValue)

    if(!(response instanceof Response)) return // !!! add newhistory pull?
    const reader = response.body?.getReader()
    
    setHistory(history => {
      const historyDuplicate = [...history]
      // create a new answer dialog block with a at work animation
      historyDuplicate.push({type : "answer", text : "", working : true})
      return historyDuplicate
    })

    if(addLetterIntervalId.current == null) 
      addLetterIntervalId.current = setInterval(() => addLetterToHistory(addLetterIntervalId), 100)

    // start reading the stream of datas
    while (true && reader) {

      const { done, value } = await reader.read();
      const chunk = decoder.decode(value, { stream: true })

      // ignore the first token if whitespace
      if(streamedDatasRef.current == "" && chunk.trim() == "") continue

      // !!! recreate callback !!!to be able to do setStreamedDatas(streamedDatas => streamedDatas + chunk)
      setStreamedDatas(chunk)

      // end of read
      if (done) {
        // stop the answer block at work animation
        setHistory(history =>
          {
            const duplicateHistory = [...history]
            duplicateHistory[duplicateHistory.length-1].working = false
            return duplicateHistory
          })
        isStreaming.current = false
        return
      }

    }
  }


  return (
    <div style={{display:'flex', flexDirection:'column', rowGap:"1rem", minWidth:800}}>
      <div ref={autoScrollHistoryRef} id="historyContainer">
          {history.map(chunk => DialogBlockFactory(chunk))}
          <div className="historyTopGradient"></div>
      </div>
      <div className='hr'/>
      <textarea className="userMessage" id="userMessage"/>
      <div className='historyNavContainer'><button onClick={handlePrevClick}>prev</button><button onClick={handleNextClick}>next</button></div>
      <button onClick={handleClick}>Send a Question to your Assistant.</button>
      {/*<div className="response">{streamedDatas}</div>*/}
    </div>
  )

  // Convert the token stream to a Char stream to improve the perception of activity
  function addLetterToHistory(intervalIdRef : React.MutableRefObject<NodeJS.Timeout | null>){
    if(intervalIdRef.current == null) return
    // If cursor is at the end of the received datas & the stream process is still active => wait for more data
    if(streamedLetterPos.current >= streamedDatasRef.current.length) return
    // If cursor is at the end of the received datas & the stream process is off => clearInterval
    if(!isStreaming.current && streamedLetterPos.current == streamedDatasRef.current.length) clearInterval(intervalIdRef.current)
    const letter = streamedDatasRef.current[streamedLetterPos.current]
    setHistory(history => {
      const duplicateHistory = [...history]
      duplicateHistory[duplicateHistory.length-1].text += letter
      return duplicateHistory
    })
    streamedLetterPos.current++
  }

  function handlePrevClick(){
    (document.querySelector(".userMessage") as HTMLTextAreaElement).value = getPreviousQuestion()
  }

  function handleNextClick(){
    (document.querySelector(".userMessage") as HTMLTextAreaElement).value = getNextQuestion()
  }

  /*function navQuestionsHistory(){
    if("next" && history.length) return
  }*/
}

export default App

export interface IHistory{
  type : "answer" | "question",
  text : string
  working ? : boolean
}