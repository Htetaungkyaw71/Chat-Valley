const express = require('express')
const http = require('http')
const path = require('path')

const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
const io = require('socket.io')(server, {
    cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        methods: ['GET', 'POST']
    }
})

app.use(express.static('public'))

let connectedPeers = []
let waitingPeers = new Map()
let unavailable = new Set()
let reports = new Map()

const emitConnectedUsers = () => {
    io.emit('connecteduser', { connectedPeers })
}

const normalizeTopic = (topic) => {
    if(typeof topic !== 'string'){
        return 'global'
    }

    const cleanTopic = topic.toLowerCase().trim()
    return cleanTopic || 'global'
}

const pickPeer = (socketId, topic) => {
    const candidates = Array.from(waitingPeers.values())
        .filter(peer => peer.socketId !== socketId)
        .filter(peer => !unavailable.has(peer.socketId))
        .filter(peer => (reports.get(peer.socketId) || 0) < 3)

    const topicMatches = candidates.filter(peer => {
        return topic === 'global' || peer.topic === 'global' || peer.topic === topic
    })

    const pool = topicMatches.length > 0 ? topicMatches : candidates
    if(pool.length === 0){
        return null
    }

    return pool[Math.floor(Math.random() * pool.length)].socketId
}

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/health',(req,res)=>{
    res.json({
        ok: true,
        connected: connectedPeers.length
    })
})

io.on('connection',(socket)=>{
    if(!connectedPeers.includes(socket.id)){
        connectedPeers.push(socket.id)
    }
    emitConnectedUsers()

    socket.on('connecteduser',()=>{
        io.to(socket.id).emit('connecteduser', { connectedPeers })
    })

    socket.on('pre_sent',(data = {})=>{
        const topic = normalizeTopic(data.topic)
        waitingPeers.set(socket.id, { socketId: socket.id, topic })

        const randomPeer = pickPeer(socket.id, topic)
        if(randomPeer){
            waitingPeers.delete(socket.id)
            waitingPeers.delete(randomPeer)
        }

        io.to(socket.id).emit('pre_sent_from_server', { randomPeer })
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
        unavailable.add(socket.id)
        const {socketId} = data
        const connectedPeer = connectedPeers.find(a=>a===socketId)
        if(connectedPeer){
            io.to(socketId).emit('sent_offer_from_server',data)
        }
    })

    socket.on('stop_video',(data = {})=>{
        waitingPeers.delete(socket.id)
        unavailable.delete(socket.id)

        const {socketId} = data
        if(socketId && (reports.get(socketId) || 0) < 3){
            unavailable.delete(socketId)
        }

        const connectedPeer = connectedPeers.find(a=>a===socketId)
        if(connectedPeer){
            io.to(socketId).emit('stop_video')
        }
    })

    socket.on('report_match',(data = {})=>{
        const {socketId} = data
        if(!socketId || !connectedPeers.includes(socketId)){
            return
        }

        reports.set(socketId, (reports.get(socketId) || 0) + 1)
        waitingPeers.delete(socketId)
        if((reports.get(socketId) || 0) >= 3){
            unavailable.add(socketId)
        }
    })

    socket.on('disconnect',()=>{
        connectedPeers = connectedPeers.filter(a=>a!==socket.id)
        waitingPeers.delete(socket.id)
        unavailable.delete(socket.id)
        reports.delete(socket.id)
        emitConnectedUsers()
    })
})

server.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})
