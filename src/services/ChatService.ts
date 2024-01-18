export class ChatService{
    static async sendQuestion(question : string) : Promise<unknown>{
        try {
            const response = await fetch('http://localhost:3000/chat',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"question" : question})      
            })
            return response
        }catch(error){
            console.error(error)
        }
    }
}