import { useEffect, useRef } from "react"

function useAutoScrollToLastItem(){

    const historyRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
    historyRef.current?.scrollTo({
        top: historyRef.current.scrollHeight,
        behavior: 'smooth'
    })
    }, [historyRef.current?.scrollHeight])

    return historyRef
}

export default useAutoScrollToLastItem