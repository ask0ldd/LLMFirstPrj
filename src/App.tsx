/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import { useRef, useState } from 'react'
import DialogBlockFactory from './assets/services/DialogBlockFactory';
import { ChatService } from './services/ChatService';
import useAutoScrollToLastItem from './hooks/useAutoScrollToLastItem';

function App() {
  const decoder = new TextDecoder('utf-8');

  const streamedLetterPos = useRef(0)
  const isStreaming = useRef(false)
  
  const [streamedDatas, _setStreamedDatas] = useState<string>("")
  const streamedDatasRef = useRef('')
  function setStreamedDatas(chunk : string){
    _setStreamedDatas(data => data + chunk)
    streamedDatasRef.current += chunk
  }
  function initStreamedDatas(){
    _setStreamedDatas("")
    streamedDatasRef.current = ""
  }

  const [history, setHistory] = useState<IHistory[]>([])

  const autoScrollHistoryRef = useAutoScrollToLastItem()

  const addLetterIntervalId = useRef<NodeJS.Timeout | null>(null)

  async function handleClick(){

    // href the element?
    const inputValue = (document.getElementById('userMessage') as HTMLTextAreaElement).value
    if(inputValue == null) return

    if(isStreaming.current) return
    isStreaming.current = true
    
    initStreamedDatas()
    
    setHistory(history => {
      const newHistory = [...history]
      newHistory.push({type : "question", text : inputValue})
      return newHistory
    })

    const response = await ChatService.sendQuestion(inputValue)

    if(!(response instanceof Response)) return
    const reader = response.body?.getReader()
    
    setHistory(history => {
      const historyDuplicate = [...history]
      // create a new answer dialog block with a at work animation
      historyDuplicate.push({type : "answer", text : "", working : true})
      return historyDuplicate
    })

    if(addLetterIntervalId.current == null) 
      addLetterIntervalId.current = setInterval(() => addLetterToHistory(addLetterIntervalId.current), 1000)

    // start reading the stream of datas
    while (true && reader) {

      const { done, value } = await reader.read();
      const chunk = decoder.decode(value, { stream: true })
      if(streamedDatasRef.current == "" && chunk.trim() == "") continue
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
      </div>
      <textarea name="userMessage" id="userMessage"/>
      <button onClick={handleClick}>fetch</button>
      <div className="response">{streamedDatas}</div>
    </div>
  )

  function addLetterToHistory(intervalId : NodeJS.Timeout | null){
    if(intervalId == null) return
    if(streamedLetterPos.current >= streamedDatasRef.current.length-1) return
    const letter = streamedDatasRef.current[streamedLetterPos.current]
    // console.log(new Date() + ' : ' + letter)
    setHistory(history => {
      const duplicateHistory = [...history]
      duplicateHistory[duplicateHistory.length-1].text += letter
      return duplicateHistory
    })
    if(!isStreaming && streamedLetterPos.current == streamedDatasRef.current.length-1) clearInterval(intervalId)
    streamedLetterPos.current++
  }
}

export default App

interface IHistory{
  type : "answer" | "question",
  text : string
  working ? : boolean
}