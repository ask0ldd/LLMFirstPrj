/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import { useRef, useState } from 'react'

function App() {
  const decoder = new TextDecoder('utf-8');
  const [streamedDatas, _setStreamedDatas] = useState<string>("")
  const streamedDatasRef = useRef('')
  function setStreamedDatas(chunk : string){
    _setStreamedDatas(data => data + chunk)
    streamedDatasRef.current += chunk
  }
  const [history, setHistory] = useState<string>("")

  async function handleClick(){

    const inputValue = (document.getElementById('userMessage') as HTMLTextAreaElement).value
    if(inputValue == null) return

    setHistory(history => history + 'Question : \n' + inputValue + '\n\n')
    setStreamedDatas('')
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
    while (true && reader) {
      const { done, value } = await reader.read();
      const chunk = decoder.decode(value, { stream: true })
      setStreamedDatas(chunk)
      if (done) {
        // Do something with last chunk of data then exit reader
        setHistory(history => history  + 'Answer : \n' + streamedDatasRef.current + '\n\n')
        return
      }
    }
  }


  return (
    <div style={{display:'flex', flexDirection:'column', rowGap:"1rem", minWidth:800}}>
      <textarea name="history" id="history" readOnly value={history}/>
      <textarea name="userMessage" id="userMessage"/>
      <button onClick={handleClick}>fetch</button>
      <div className="response">{streamedDatas}</div>
    </div>
  )
}

export default App
