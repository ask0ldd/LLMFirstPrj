import Answer from "../../components/Answer";
import Question from "../../components/Question";

function DialogBlockFactory({ type, text, working } : {type : "question" | "answer", text : string, working? : boolean}){
    if(type == "question") return(<Question text={text}></Question>)
    return(<Answer working={working || false} text={text}></Answer>)
}

export default DialogBlockFactory