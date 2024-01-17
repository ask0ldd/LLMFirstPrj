import '../style/Answer.css'

function Answer({working, text} : {working : boolean, text : string}){
    return(
        <article className={working ? 'answer working' : 'answer'}  >
            <h3>Answer :</h3>
            <span>{text}</span>
        </article>
    )
}

export default Answer