export default class WebcamVideo {
  constructor(onReceivingData) {
    this.videoTarget = document.createElement('video')
    this.videoConstraints = {
      audio: false,
      video: {
        width: 1280,
        height: 720
      }
    }
    this.aspectRatio = this.videoConstraints.video.width / this.videoConstraints.video.height
    this.onReceivingData = onReceivingData
    this.init()
  }

  init() {
    navigator.mediaDevices.getUserMedia(this.videoConstraints).then(mediaStream => {
      this.videoTarget.srcObject = mediaStream
      this.videoTarget.onloadedmetadata = () => {
        this.onLoad()
      }
    }).catch(e => {
      alert(e.name + ': ' + err.message)
    })
  }

  onLoad() {
    this.videoTarget.setAttribute('autoplay', 'true')
    this.videoTarget.setAttribute('playsinline', 'true')
    this.videoTarget.play()
    this.onReceivingData()
  }

  destroy() {
    const tracks = this.videoTarget.srcObject
    tracks.getTracks().forEach(track => track.stop())

    this.videoTarget.stop()

    this.videoTarget = null
    this.videoConstraints = null
    this.aspectRatio = null
    this.onReceivingData = null
  }
}