/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import { useState } from 'react'

function App() {
  const decoder = new TextDecoder('utf-8');
  const [streamedDatas, setStreamedDatas] = useState<string>("")

  async function handleClick(){
    const inputValue = (document.getElementById('userMessage') as HTMLInputElement).value
    if(inputValue == null) return
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
      setStreamedDatas(data => data + chunk)
      if (done) {
        // Do something with last chunk of data then exit reader
        return
      }
    }
  }


  return (
    <div style={{display:'flex', flexDirection:'column', columnGap:"1rem"}}>
      <input name="userMessage" id="userMessage" type="text"/>
      <button onClick={handleClick}>fetch</button>
      <span>{streamedDatas}</span>
    </div>
  )
}

export default App
