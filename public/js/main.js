import * as register from "./register.js"
import * as contasts from "./contasts.js"
import * as handler from "./handler.js"
import * as stranger from "./stranger.js"



const configuredSocketUrl = document.querySelector('meta[name="socket-url"]')?.content.trim()
const savedSocketUrl = localStorage.getItem('CHAT_VALLEY_SOCKET_URL')?.trim()
const socketUrl = configuredSocketUrl || savedSocketUrl || undefined
const socket = io(socketUrl, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 8,
    timeout: 12000
});
let selectedTopic = "global";
const connectionError = document.getElementById('err')

socket.on("connect_error", () => {
    if(connectionError){
        connectionError.innerHTML = "Realtime server is not connected. Check the Socket.io backend URL."
    }
})


register.start(socket)
handler.getLocalStream()

const topicButtons = document.querySelectorAll(".topic-chip")
const topicBadge = document.getElementById("topic_badge")

topicButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedTopic = button.dataset.topic || "global";
        topicButtons.forEach(topicButton => {
            const isActive = topicButton === button;
            topicButton.classList.toggle("active", isActive)
            topicButton.setAttribute("aria-pressed", String(isActive))
        })
        if(topicBadge){
            topicBadge.innerHTML = button.innerHTML
        }
    })
})

// start chatting with video

let video_chat = document.getElementById('video_chat')
video_chat.addEventListener('click',()=>{
    stranger.pre_sent_first(contasts.callType.VIDEO_STRANGERS, selectedTopic)
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

let toggleMic = document.getElementById('toggle_mic')
toggleMic.addEventListener('click',()=>{
    const isMuted = handler.toggleMediaTrack('audio')
    toggleMic.setAttribute('aria-pressed', String(isMuted))
    toggleMic.innerHTML = isMuted ? 'Unmute' : 'Mic'
})

let toggleCamera = document.getElementById('toggle_camera')
toggleCamera.addEventListener('click',()=>{
    const isCameraOff = handler.toggleMediaTrack('video')
    toggleCamera.setAttribute('aria-pressed', String(isCameraOff))
    toggleCamera.innerHTML = isCameraOff ? 'Show' : 'Camera'
})

let report = document.getElementById('report')
report.addEventListener('click',()=>{
    handler.report_current_match()
})

let previewToggle = document.getElementById('preview_toggle')
previewToggle.addEventListener('click',()=>{
    document.querySelector('.local-tile')?.classList.toggle('preview-expanded')
})
