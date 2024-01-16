import '../style/Question.css'

function Question({text} : {text : string}){
    return(
        <article>
            <h3>Question</h3>
            <span>{text}</span>
        </article>
    )
}

export default Question