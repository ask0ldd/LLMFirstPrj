import Answer from "../../components/Answer";
import Question from "../../components/Question";

function DialogBlockFactory({ type, text } : {type : "question" | "answer", text : string}){
    if(type == "question") return(<Question text={text}></Question>)
    return(<Answer text={text}></Answer>)
}

export default DialogBlockFactory