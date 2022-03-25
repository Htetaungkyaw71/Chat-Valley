import * as store from "./store.js"
import * as handler from "./handler.js"
import * as contasts from "./contasts.js"
import * as stranger from "./stranger.js"
import * as main from "./main.js"

let socketIo;
export const start = (socket)=>{
    socketIo = socket
    socketIo.on('connect',()=>{
        connecteduser()
        store.setSocketId(socketIo.id)
    
        socketIo.on('pre_sent_from_server',data=>{
            stranger.pre_sent(data)
        })
        socketIo.on('pre_sent_offer',(data)=>{
            handler.handle_pre_offer_answer(data)
        })
        socketIo.on('pre_offer_answer',(data)=>{
            handler.handle_offer_answer(data)
        })
        socketIo.on('stop_video',()=>{
            handler.next_handle_stop_video()
        })
        socketIo.on('connecteduser',(data)=>{
            main.connected(data)
        })
    
        

        socketIo.on('sent_offer_from_server',data=>{
            switch (data.type) {
                case contasts.webSignaling.OFFER:
                    handler.handle_offer(data)
                    break;
                case contasts.webSignaling.ANSWER:
                    handler.handle_answer(data)    
                    break;
                case contasts.webSignaling.ICE_CANDIDATE:
                    handler.handle_candidate(data)    
                    break;
            
                default:
                    break;
            }
        })
        socket.on('sent_callerId_from_server',data=>{
            handler.pre_answer(data)
        })
        
    })
    
}

export const pre_sent = ()=>{
    socketIo.emit('pre_sent')
}
export const sendPreOfferAnswer = (data)=>{
    socketIo.emit('pre_offer_answer',data)
}

const connecteduser = ()=>{
    socketIo.emit('connecteduser')
}


export const pre_sent_offer = (data)=>{
    socketIo.emit('pre_sent_offer',data)

}


export const sentWebOffer = (data)=>{
    socketIo.emit('sent_offer',data)
}

export const stop_video = (data)=>{
    socketIo.emit('stop_video',data)
}
