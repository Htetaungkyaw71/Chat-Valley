import * as contasts from "./contasts.js"
import * as store from "./store.js"

export const Change_Video_Ui = ()=>{
    let first = document.getElementById('first')
    let navbar = document.getElementById('navbar')
    let loading = document.getElementById('loading')
    let video_container = document.getElementById('video_container')
    let remote_video = document.getElementById('remote_video')
    let call_status = document.getElementById('call_status')

    loading.style.display = "none";
    call_status.innerHTML = "Connected"

    
    HideElement(first)
    HideElement(loading)
    ShowElement(video_container)
    ShowElement(remote_video)

}


export const updateLocalStream = (localStream)=>{
    let local_video = document.getElementById('local_video')
    local_video.srcObject = localStream
    local_video.addEventListener('loadedmetadata',()=>{
        updateVideoShape(local_video, 'local')
        local_video.play()
    })
  
}

export const updateRemoteStream = (remoteStream)=>{
    let remote_video = document.getElementById('remote_video')
    remote_video.srcObject = remoteStream
    remote_video.addEventListener('loadedmetadata',()=>{
        updateVideoShape(remote_video, 'remote')
        remote_video.play()
    })
}

export const nostrangers = ()=>{
    let first = document.getElementById('first')
    let video_container = document.getElementById('video_container')
    let navbar = document.getElementById('navbar')
    let nostranger = document.getElementById('nostranger')
    ShowElement(navbar)
    ShowElement(nostranger)
    ShowElement(first)
    setTimeout(()=>HideElement(nostranger),3000)
    HideElement(video_container)
}

export const updateUiClose = (callType)=>{
    if(callType === contasts.callType.VIDEO_STRANGERS){
        let first = document.getElementById('first')
        let navbar = document.getElementById('navbar')

        let video_container = document.getElementById('video_container')      
        ShowElement(first)
        ShowElement(navbar)
        HideElement(video_container)
    }
}
export const updateLoading = ()=>{
    let first = document.getElementById('first')
    let navbar = document.getElementById('navbar')
    let video_container = document.getElementById('video_container')
    let loading = document.getElementById('loading')
    let remote_video = document.getElementById('remote_video')
    let call_status = document.getElementById('call_status')
    loading.style.display = "flex"
    call_status.innerHTML = "Finding a stranger..."
    clearVideoShape('remote')
    HideElement(first)
    HideElement(remote_video)
    ShowElement(video_container)
    ShowElement(loading)

    
}
export const nextDisabled = ()=>{
    let next = document.getElementById('next')
    next.setAttribute("disabled","");

}
export const nextOpen = ()=>{
    let next = document.getElementById('next')
    next.removeAttribute("disabled");

}

// ui helper

const updateVideoShape = (video, role)=>{
    const tile = video.closest('.video-tile')
    const video_container = document.getElementById('video_container')

    if(!tile || !video_container || !video.videoWidth || !video.videoHeight){
        return
    }

    const shape = video.videoHeight > video.videoWidth * 1.08
        ? 'portrait'
        : video.videoWidth > video.videoHeight * 1.08
            ? 'landscape'
            : 'square'

    tile.classList.remove('is-portrait', 'is-landscape', 'is-square')
    tile.classList.add(`is-${shape}`)
    video_container.dataset[`${role}Shape`] = shape
    syncCallLayout(video_container)
}

const clearVideoShape = (role)=>{
    const video_container = document.getElementById('video_container')
    const tile = document.querySelector(`.${role}-tile`)

    if(tile){
        tile.classList.remove('is-portrait', 'is-landscape', 'is-square')
    }

    if(video_container){
        delete video_container.dataset[`${role}Shape`]
        syncCallLayout(video_container)
    }
}

const syncCallLayout = (video_container)=>{
    const remoteShape = video_container.dataset.remoteShape
    const localShape = video_container.dataset.localShape
    const layoutClasses = [
        'same-video-shapes',
        'mixed-video-shapes',
        'remote-portrait',
        'remote-landscape',
        'local-portrait',
        'local-landscape'
    ]

    video_container.classList.remove(...layoutClasses)

    if(remoteShape){
        video_container.classList.add(`remote-${remoteShape}`)
    }

    if(localShape){
        video_container.classList.add(`local-${localShape}`)
    }

    if(remoteShape && localShape){
        video_container.classList.add(remoteShape === localShape ? 'same-video-shapes' : 'mixed-video-shapes')
    }
}

const ShowElement = (element)=>{
    if(element.classList.contains('hidden')){
        element.classList.remove('hidden')
    }
}

const HideElement = (element)=>{
    if(!element.classList.contains('hidden')){
        element.classList.add('hidden')
    }
}
