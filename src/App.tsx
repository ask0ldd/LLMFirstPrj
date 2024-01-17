/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import { useEffect, useRef, useState } from 'react'
import DialogBlockFactory from './assets/services/DialogBlockFactory';

function App() {
  const decoder = new TextDecoder('utf-8');

  const streamedDatasPos = useRef(0)
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

  const historyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [historyRef.current?.scrollHeight])

  let addLetterIntervalId: NodeJS.Timeout | null = null

  async function handleClick(){

    if(isStreaming.current) return

    // href the element?
    const inputValue = (document.getElementById('userMessage') as HTMLTextAreaElement).value
    if(inputValue == null) return

    if(addLetterIntervalId == null) addLetterIntervalId = setInterval(addLetterToHistory, 1000)
    
    initStreamedDatas()
    
    setHistory(history => {
      const newHistory = [...history]
      newHistory.push({type : "question", text : inputValue})
      return newHistory
    })

    const response = await fetch('http://localhost:3000/chat',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"question" : inputValue})      
    })

    const reader = response.body?.getReader()
    
    setHistory(history => {
      const historyDuplicate = [...history]
      // create a new answer dialog block with a at work animation
      historyDuplicate.push({type : "answer", text : "", working : true})
      return historyDuplicate
    })

    isStreaming.current = true

    // start reading the stream of datas
    while (true && reader) {

      const { done, value } = await reader.read();
      const chunk = decoder.decode(value, { stream: true })
      if(streamedDatasRef.current == "" && chunk.trim() == "") continue
      setStreamedDatas(chunk)
      /*setHistory(history => {
        const historyDuplicate = [...history]
        historyDuplicate[history.length-1].text = streamedDatasRef.current
        return historyDuplicate
      })*/

      // end of read
      if (done) {
        // stop the answer block at work animation
        setHistory(history =>
          {
            const duplicateHistory = [...history]
            duplicateHistory[duplicateHistory.length-1].working = false
            return duplicateHistory
          })
        clearInterval(addLetterIntervalId)
        isStreaming.current = false
        return
      }

    }
  }


  return (
    <div style={{display:'flex', flexDirection:'column', rowGap:"1rem", minWidth:800}}>
      <div /*onScroll={handleHistoryScroll}*/ ref={historyRef} id="historyContainer">
          {history.map(chunk => DialogBlockFactory(chunk))}
      </div>
      <textarea name="userMessage" id="userMessage"/>
      <button onClick={handleClick}>fetch</button>
      <div className="response">{streamedDatas}</div>
    </div>
  )

  function addLetterToHistory(){
    if(streamedDatasPos.current >= streamedDatasRef.current.length-1) return
    setHistory( history => {
      const duplicateHistory = [...history]
      duplicateHistory[history.length-1].text += streamedDatasRef.current[streamedDatasPos.current]
      return duplicateHistory
    })
    streamedDatasPos.current++
  }

  /*function handleHistoryScroll(){
    historyRef.current?.scrollBy(0, 10)
  }*/
}

export default App

interface IHistory{
  type : "answer" | "question",
  text : string
  working ? : boolean
}