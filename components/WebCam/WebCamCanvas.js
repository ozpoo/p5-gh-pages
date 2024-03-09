import WebcamVideo from './WebcamVideo'

export default class WebcamCanvas {
  constructor(_width = 500) {
    this.width = _width

    this.video = new WebcamVideo(this.setLive.bind(this))
    this.aspectRatio = this.video.aspectRatio

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.width / this.aspectRatio
    this.context = this.canvas.getContext('2d')

    this.live = false
    this.dimensions = this.getDimensions()

    this.attachListeners = this.attachListeners.bind(this)
    this.onResize = this.onResize.bind(this)

    this.onResize()
    this.attachListeners()
  }

  attachListeners() {
    window.addEventListener('resize', this.onResize)
  }

  detachListeners() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize() {
    this.dimensions = this.getDimensions()
  }

  setLive() {
    this.live = true
  }

  update() {
    this.context.drawImage(
      this.video.videoTarget,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
  }

  getDimensions() {
    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight

    let width = innerWidth
    let height = width / this.aspectRatio

    if(height < innerHeight) {
      height = innerHeight
      width = height * this.aspectRatio
    }

    const offsetX = (width - innerWidth) / 2
    const offsetY = (height - innerHeight) / 2

    return {
      width,
      height,
      offsetX,
      offsetY
    }
  }

  destroy() {
    this.detachListeners()
    this.video.destroy()
    this.width = null
    this.video = null
    this.aspectRatio = null
    this.canvas = null
    this.canvas.width = null
    this.canvas.height = null
    this.context = null
    this.live = null
    this.dimensions = null
    this.attachListeners = null
    this.onResize = null
  }
}