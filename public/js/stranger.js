import * as register from "./register.js"
import * as handler from "./handler.js"
import * as ui from "./ui.js"

let StrangerCallType;
export const pre_sent_first = (callType)=>{
    StrangerCallType = callType
    register.pre_sent()
}


export const pre_sent = async(data)=>{
    if(data.randomPeer){
        ui.Change_Video_Ui()
        handler.sendPreOffer(StrangerCallType,data.randomPeer)           
    }else{
        ui.nostrangers()
    }
}