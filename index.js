const express = require('express')
const http = require('http')
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
app.use(express.static('public'))


let connectedPeers = []
let click_videos = []
let unavailable= []


app.get('/',(req,res)=>{
    res.sendFile(__dirname+'public/index.html')
})

io.on('connection',(socket)=>{
    connectedPeers.push(socket.id)

    socket.on('connecteduser',()=>{
        let data = {
            connectedPeers
        }
        io.to(socket.id).emit('connecteduser',data)
    })

    socket.on('pre_sent',()=>{
        click_videos.push(socket.id)

        let randomPeer;
        
        const randomPeers = click_videos.filter(a=>a!==socket.id)

        if(randomPeers.length > 0){
            randomPeer = randomPeers.filter(x => !unavailable.includes(x));
        }else{
            randomPeer = null
        }
        if(randomPeer){
            if(randomPeer.length > 0){
                randomPeer = randomPeer[Math.floor(Math.random() * randomPeer.length)]
            }else{
                let data = {
                    preofferanswer :'REJECT'    
                }
                io.to(socket.id).emit('pre_offer_answer',data)
            }
        }
        const data = {
            randomPeer
        }
        io.to(socket.id).emit('pre_sent_from_server',data)

    })

    socket.on('pre_sent_offer',data=>{
        const connectedPeer = connectedPeers.find(a=>a===data.callee)
        let newdata = {
            callerId:socket.id,
            callType:data.callType
        }
        if(connectedPeer){
            io.to(data.callee).emit('pre_sent_offer',newdata)
        }
    })
    socket.on('pre_offer_answer',(data)=>{

        const {callerSocketId} = data
        let connectedpeer = connectedPeers.find(c=>c === callerSocketId)
        if(connectedpeer){
            io.to(callerSocketId).emit('pre_offer_answer',data)       
        }
    })
    
   
    socket.on('sent_offer',data=>{
        unavailable.push(socket.id)
        const {socketId} = data 
        const connectedPeer = connectedPeers.find(a=>a===socketId)
        if(connectedPeer){
            io.to(socketId).emit('sent_offer_from_server',data)
        }
    })
    socket.on('stop_video',data=>{
        let newclick = click_videos.filter(a=>a!==socket.id)
        click_videos = newclick
        const {socketId} = data 
        const connectedPeer = connectedPeers.find(a=>a===socketId)
        let available = unavailable.filter(a=>a!==socket.id)
        unavailable = available
        if(connectedPeer){
            io.to(socketId).emit('stop_video')
        }
    })


    


    socket.on('disconnect',()=>{
        let newconnectedPeers = connectedPeers.filter(a=>a!==socket.id)
        connectedPeers = newconnectedPeers
        let newclick = click_videos.filter(a=>a!==socket.id)
        click_videos = newclick
        let available = unavailable.filter(a=>a!==socket.id)
        unavailable = available
    })
})


server.listen(PORT,(req,res)=>{
    console.log("server is running")
})