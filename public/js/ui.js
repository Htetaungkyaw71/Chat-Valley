import * as contasts from "./contasts.js"
import * as store from "./store.js"

export const Change_Video_Ui = ()=>{
    let first = document.getElementById('first')
    let navbar = document.getElementById('navbar')
    let loading = document.getElementById('loading')
    let video_container = document.getElementById('video_container')
    let remote_video = document.getElementById('remote_video')

    loading.style.display = "none";

    
    HideElement(first)
    HideElement(navbar)
    HideElement(loading)
    ShowElement(video_container)
    ShowElement(remote_video)

}


export const updateLocalStream = (localStream)=>{
    let local_video = document.getElementById('local_video')
    local_video.srcObject = localStream
    local_video.addEventListener('loadedmetadata',()=>{
        local_video.play()
    })
  
}

export const updateRemoteStream = (remoteStream)=>{
    let remote_video = document.getElementById('remote_video')
    remote_video.srcObject = remoteStream
    remote_video.addEventListener('loadedmetadata',()=>{
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
    loading.style.display = "flex"
    HideElement(first)
    HideElement(navbar)
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

