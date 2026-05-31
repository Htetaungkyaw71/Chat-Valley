import * as contasts from "./contasts.js"
import * as store from "./store.js"
import * as ui from "./ui.js"
import * as register from "./register.js"
import * as stranger from "./stranger.js"


let connectedUserDetails;
export const sendPreOffer = (callType,callee)=>{
    ui.updateLoading()
    connectedUserDetails = {
        socketId:callee,
        callType:callType
    }
    if(callType === contasts.callType.VIDEO_STRANGERS){
        let data = {
            callType,
            callee
        }
    
        register.pre_sent_offer(data)
    }
}



let peerConnection;
const defaultdata = {
    video:{
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
    },
    audio:true
}

export const getLocalStream = ()=>{
    navigator.mediaDevices.getUserMedia(defaultdata)
    .then(stream=>{
        document.getElementById('video_chat').disabled = false;
        document.getElementById('err').innerHTML = "";
        store.setlocalStream(stream)
        ui.updateLocalStream(stream)
    })
    .catch(()=>{
        document.getElementById('video_chat').disabled = true;   
        document.getElementById('err').innerHTML = "Camera or microphone access is blocked. Enable both permissions and refresh Chat Valley."; 
   
    })
  
}

export const toggleMediaTrack = (kind)=>{
    const localStream = store.getState().localStream;
    if(!localStream){
        return false
    }

    const tracks = kind === "audio" ? localStream.getAudioTracks() : localStream.getVideoTracks();
    tracks.forEach(track => {
        track.enabled = !track.enabled
    })

    return tracks.length > 0 ? !tracks[0].enabled : false
}

export const report_current_match = ()=>{
    if(connectedUserDetails){
        register.report_match({
            socketId: connectedUserDetails.socketId
        })
        next_stop_video()
    }else{
        ui.nostrangers()
    }
}


let configuration = {
    iceServers : [
        {
            urls: "stun:stun.l.google.com:19302"
        },
        {
            urls: "stun:stun1.l.google.com:19302"
        }
    ]
}

const createPeerConnection = ()=>{
    peerConnection = new RTCPeerConnection(configuration)
    peerConnection.onicecandidate = (event)=>{
        if(event.candidate){
            register.sentWebOffer({
                socketId:connectedUserDetails.socketId,
                type:contasts.webSignaling.ICE_CANDIDATE,
                candidate:event.candidate
            })
        }
        
    }
    peerConnection.onconnectionstatechange = ()=>{
        if(peerConnection.connectionState === 'connected'){
            ui.Change_Video_Ui() 
            ui.nextOpen()
        }
    }


    // get remote video

    let remoteStream = new MediaStream()
    store.setremoteStream(remoteStream)
    ui.updateRemoteStream(remoteStream)

    peerConnection.ontrack = (event)=>{
        remoteStream.addTrack(event.track)
    }


    if(connectedUserDetails.callType === contasts.callType.VIDEO_STRANGERS){
        const localStream = store.getState().localStream;
        for (const track of localStream.getTracks()){
            peerConnection.addTrack(track, localStream)
        }
    }

}




export const handle_pre_offer_answer = (data)=>{
    const {callerId,callType} = data
    connectedUserDetails = {
        socketId:callerId,
        callType
    } 
    if(callType === contasts.callType.VIDEO_STRANGERS){
        createPeerConnection()
        sendPreOfferAnswer(contasts.OFFER.ACCEPT)
    }

 
}


const sendPreOfferAnswer = (preofferanswer)=>{
    const data = {
        callerSocketId:connectedUserDetails.socketId,
        preofferanswer
    }
  

    register.sendPreOfferAnswer(data)
}

export const handle_offer_answer = (data)=>{
    let {preofferanswer} = data
    if(preofferanswer === contasts.OFFER.ACCEPT){
        createPeerConnection()
        webSentOffer()
    }
    if(preofferanswer === contasts.OFFER.REJECT){   
        ui.updateLoading()
        ui.nextDisabled()
    }
}

export const stop_video = ()=>{
    if(!connectedUserDetails){
        ui.updateUiClose(contasts.callType.VIDEO_STRANGERS)
        return
    }
    let data = {
        socketId:connectedUserDetails.socketId
    }
    register.stop_video(data)
    closePeerConnection()
}

export const handle_stop_video = ()=>{
    nextclosePeerConnection()
    if(connectedUserDetails){
        stranger.pre_sent_first(connectedUserDetails.callType)
    } 
}

export const next_stop_video = async()=>{
    if(!connectedUserDetails){
        ui.updateLoading()
        await stranger.pre_sent_first(contasts.callType.VIDEO_STRANGERS)
        return
    }

    let data = {
        socketId:connectedUserDetails.socketId
    }
    register.stop_video(data)

    
    if(connectedUserDetails){
        await nextclosePeerConnection()
        ui.updateLoading()
        await stranger.pre_sent_first(connectedUserDetails.callType)
    }    
}



export const next_handle_stop_video = async()=>{
    if(peerConnection){
        peerConnection.onconnectionstatechange = ()=>{
            if(peerConnection.connectionState === 'disconnected'){
                if(connectedUserDetails){
                    nextclosePeerConnection()
                    next_stop_video()
                }else{
                    closePeerConnection()
                    ui.nostrangers()
            
                }
            }
        }
    }
   
   
 

}




const nextclosePeerConnection = ()=>{
    if(peerConnection){
        peerConnection.close()
        peerConnection = null;
    }
    
    const remoteStream = store.getState().remoteStream;
    if(connectedUserDetails && connectedUserDetails.callType === contasts.callType.VIDEO_STRANGERS && remoteStream){
        remoteStream.getVideoTracks().forEach(track => track.enabled = true)
        remoteStream.getAudioTracks().forEach(track => track.enabled = true)
    }
}

const closePeerConnection = ()=>{
    if(peerConnection){
        peerConnection.close()
        peerConnection = null;
    }
    const localStream = store.getState().localStream;
    if(connectedUserDetails && connectedUserDetails.callType === contasts.callType.VIDEO_STRANGERS){
        if(localStream){
            localStream.getVideoTracks().forEach(track => track.enabled = true)
            localStream.getAudioTracks().forEach(track => track.enabled = true)
        }
        ui.updateUiClose(connectedUserDetails.callType)
        connectedUserDetails = null
    }
}


const webSentOffer = async()=>{
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer)
    register.sentWebOffer({
        socketId:connectedUserDetails.socketId,
        type:contasts.webSignaling.OFFER,
        offer:offer
    })
  

     
}

export const handle_offer = async(data)=>{
    await peerConnection.setRemoteDescription(data.offer)
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer)

    register.sentWebOffer({
        socketId:connectedUserDetails.socketId,
        type:contasts.webSignaling.ANSWER,
        answer:answer
    })
}

export const handle_answer = async(data)=>{
    await peerConnection.setRemoteDescription(data.answer)
}

export const handle_candidate = async(data)=>{
    try {   
        await peerConnection.addIceCandidate(data.candidate)
    } catch (err) {
        console.log(err)
    }
}
