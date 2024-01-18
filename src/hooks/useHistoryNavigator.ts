/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef } from "react"
import { IHistory } from "../App"

function useHistoryNavigator(history : IHistory[]){

    const historyPos = useRef(0)

    function goToNextQuestion() {

    }

    function goToPreviousQuestion() {

    }

    function goToLastQuestion(){

    }

    return {goToNextQuestion, goToPreviousQuestion, goToLastQuestion}

}

export default useHistoryNavigator