/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import { useRef, useState } from 'react'
import DialogBlockFactory from './assets/services/DialogBlockFactory';

function App() {
  const decoder = new TextDecoder('utf-8');
  
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

  async function handleClick(){

    const inputValue = (document.getElementById('userMessage') as HTMLTextAreaElement).value
    if(inputValue == null) return
    
    initStreamedDatas()
    // setHistory(history => history + '\n\nQuestion :\n' + inputValue + '\n\nAnswer :\n')
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
    // eslint-disable-next-line no-constant-condition
    setHistory(history => {
      const historyDuplicate = [...history]
      historyDuplicate.push({type : "answer", text : "", working : true})
      return historyDuplicate
    })
    while (true && reader) {
      const { done, value } = await reader.read();
      const chunk = decoder.decode(value, { stream: true })
      if(streamedDatasRef.current == "" && chunk.trim() == "") continue
      setStreamedDatas(chunk)
      setHistory(history => {
        const historyDuplicate = [...history]
        historyDuplicate[history.length-1].text = streamedDatasRef.current
        return historyDuplicate
      })
      if (done) {
        setHistory(history =>
          {
            const duplicateHistory = [...history]
            duplicateHistory[duplicateHistory.length-1].working = false
            return duplicateHistory
          })
        // Do something with last chunk of data then exit reader
        // setHistory(history => history  + 'Answer : \n' + streamedDatasRef.current.trim() + '\n\n')
        /*setHistory(history => {
          const newHistory = [...history]
          newHistory.push({type : "answer", text : streamedDatasRef.current})
          return newHistory
        })*/
        return
      }
    }
  }


  return (
    <div style={{display:'flex', flexDirection:'column', rowGap:"1rem", minWidth:800}}>
      <div id="historyContainer">
          {history.map(chunk => DialogBlockFactory(chunk))}
      </div>
      <textarea name="userMessage" id="userMessage"/>
      <button onClick={handleClick}>fetch</button>
      <div className="response">{streamedDatas}</div>
    </div>
  )
}

export default App

interface IHistory{
  type : "answer" | "question",
  text : string
  working ? : boolean
}