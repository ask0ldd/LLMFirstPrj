import './App.css'
import {fileURLToPath} from "url"
import path from "path"
import {LlamaModel, LlamaContext, LlamaChatSession} from "node-llama-cpp"
import { useEffect, useState } from 'react'

async function App() {
    // new URL('file:///C:/path/').pathname;      // Incorrect: /C:/path/
  // fileURLToPath('file:///C:/path/');

  // const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const __dirname = path.dirname(fileURLToPath("file:///G:/AI"))

  const model = new LlamaModel({
      modelPath: path.join(__dirname, "models", "mistral-7b-openorca-oasst_top1_2023-08-25-v2.Q4_K_M")
  });
  const context = new LlamaContext({model})
  const session = new LlamaChatSession({context})

  const [questions, setQuestions] = useState<Array<string>>([])
  const [answers, setAnswers] = useState<Array<string>>([])

  useEffect(() => {
    const loadAnswers = async () => {
      const q1 = "Hi there, how are you?"
      console.log("User: " + q1)
      const a1 = await session.prompt(q1)
      console.log("AI: " + a1)
      const q2 = "Summerize what you said"
      console.log("User: " + q2)
      const a2 = await session.prompt(q2)
      setQuestions([q1, q2])
      setAnswers([a1, a2])
    }

    loadAnswers()
  }, [])

  return (
    <>
      <span>{questions[0]}</span><br/>
      <span>{answers[0]}</span><br/>
      <span>{questions[1]}</span><br/>
      <span>{answers[1]}</span><br/>
    </>
  )
}

export default App
