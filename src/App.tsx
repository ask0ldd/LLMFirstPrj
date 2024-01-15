/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const decoder = new TextDecoder('utf-8');
  const [streamedDatas, setStreamedDatas] = useState<string>("")

  /*useEffect(() => {

    fetch('http://localhost:3000/chat',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"question" : "what is the name of earth's satellite?"})      
    })
      .then(response => {
        const reader = response.body?.getReader()
        reader?.read().then(function pump ({ done, value }) : void {
          if (done) {
            // Do something with last chunk of data then exit reader
            setStreamedDatas(streamedDatas => streamedDatas + value)
            return;
          }
          // Otherwise do something here to process current chunk
          setStreamedDatas(streamedDatas => streamedDatas + value)
          // Read some more, and call this function again
          reader.read().then(pump)
          return 
        });
      })
      .catch(error => console.error('Error fetching the stream: ', error))

  }, [])*/

  async function handleClick(){
    setStreamedDatas('')
    const response = await fetch('http://localhost:3000/chat',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"question" : "what is the name of earth's satellite?"})      
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
    <>
      <button onClick={handleClick}>fetch</button><br/>
      <span>{streamedDatas}</span>
    </>
  )
}

export default App
