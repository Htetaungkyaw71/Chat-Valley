import * as contasts from "./contasts.js"

let state = {
    socketId :null,
    localStream:null,
    remoteStream:null,

}

export const setSocketId = (socketId) =>{
    state = {
        ...state,
        socketId:socketId
    }
}
export const setlocalStream = (stream) =>{
    state = {
        ...state,
        localStream:stream
    }
}
export const setremoteStream = (stream) =>{
    state = {
        ...state,
        remoteStream:stream
    }
}

export const getState = () =>{
    return state
}