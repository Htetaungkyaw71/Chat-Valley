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
    video:true,
    audio:true
}

export const getLocalStream = ()=>{
    navigator.mediaDevices.getUserMedia(defaultdata)
    .then(stream=>{
        store.setlocalStream(stream)
        ui.updateLocalStream(stream)
    })
  
}


let configuration = {
    iceServers : [
        {
            urls: "stun:stun.l.google.com:13902"
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
        ui.Change_Video_Ui() 
        createPeerConnection()
        webSentOffer()
    }
    if(preofferanswer === contasts.OFFER.REJECT){   
        ui.updateLoading()
        ui.nextDisabled()
    }
}

export const stop_video = ()=>{
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
    
    if(connectedUserDetails.callType === contasts.callType.VIDEO_STRANGERS){
        store.getState().remoteStream.getVideoTracks()[0].enabled = true
        store.getState().remoteStream.getAudioTracks()[0].enabled = true
    }
}

const closePeerConnection = ()=>{
    if(peerConnection){
        peerConnection.close()
        peerConnection = null;
    }
    if(connectedUserDetails.callType === contasts.callType.VIDEO_STRANGERS){
        store.getState().localStream.getVideoTracks()[0].enabled = true
        store.getState().localStream.getAudioTracks()[0].enabled = true
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
