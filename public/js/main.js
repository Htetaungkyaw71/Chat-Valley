import * as register from "./register.js"
import * as contasts from "./contasts.js"
import * as handler from "./handler.js"
import * as stranger from "./stranger.js"



let socket = io();


register.start(socket)
handler.getLocalStream()

/// start chatting with video

let video_chat = document.getElementById('video_chat')
video_chat.addEventListener('click',()=>{
    stranger.pre_sent_first(contasts.callType.VIDEO_STRANGERS)
})


export const connected = (data)=>{
    let c = document.getElementById('connected')
    if(data.connectedPeers.length > 0){
        c.innerHTML = data.connectedPeers.length 
    }else{
        c.innerHTML = "0"
    }
}





let stop = document.getElementById('stop')
stop.addEventListener('click',()=>{
    handler.stop_video()
})


let next = document.getElementById('next')
next.addEventListener('click',()=>{
    handler.next_stop_video()
})

