/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef } from "react"
import { IHistory } from "../App"

function useHistoryNavigator(history : IHistory[] /*, userMessageRef */){

    const historyPos = useRef(0)

    function getNextQuestion() : string {
        if(historyPos.current + 2 > history.length-1) return history[historyPos.current].text
        historyPos.current += 2
        return history[historyPos.current].text
    }

    function getPreviousQuestion() : string {
        if(historyPos.current - 2 < 0) return history[historyPos.current].text
        historyPos.current -= 2
        return history[historyPos.current].text
    }

    function getLastQuestion() : string{
        historyPos.current = history.length-2
        return history[historyPos.current].text
    }

    return {getNextQuestion, getPreviousQuestion, getLastQuestion}

}

export default useHistoryNavigator