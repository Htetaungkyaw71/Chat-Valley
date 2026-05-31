import * as register from "./register.js"
import * as handler from "./handler.js"
import * as ui from "./ui.js"

let StrangerCallType;
let StrangerTopic = "global";

export const pre_sent_first = (callType, topic = StrangerTopic)=>{
    StrangerCallType = callType
    StrangerTopic = topic || "global"
    register.pre_sent({ topic: StrangerTopic })
}


export const pre_sent = async(data)=>{
    if(data.randomPeer){
        handler.sendPreOffer(StrangerCallType,data.randomPeer)
    }else{
        ui.nostrangers()
    }
}
