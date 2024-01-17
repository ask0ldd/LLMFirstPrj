import '../style/Answer.css'

function Answer({text} : {text : string}){
    return(
        <article className='answer'>
            <h3>Answer :</h3>
            <span>{text}</span>
        </article>
    )
}

export default Answer