import '../style/Question.css'

function Question({text} : {text : string}){
    return(
        <article className='question'>
            <h3>Question :</h3>
            <span>{text}</span>
        </article>
    )
}

export default Question