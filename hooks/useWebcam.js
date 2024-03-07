import { useRef } from 'react'

export default function useWebcam() {
	const constraints = {
	  audio: false,
	  video: {
	    width: 1280,
	    height: 720
	  }
	}

	const live = useRef(null)
	const stream = useRef(null)

  async function init() {
  	return new Promise(resolve => {
  		stream.current = document.createElement('video')

	    navigator.mediaDevices.getUserMedia(constraints).then(mediaStream => {
	      stream.current.srcObject = mediaStream
	      stream.current.onloadedmetadata = () => {
	        onLoad()
	        resolve(true)
	      }
	    }).catch(e => {
	      onError(e)
	      resolve(false)
	    })
	  })
  }

  function onLoad() {
    stream.current.setAttribute('autoplay', 'true')
    stream.current.setAttribute('playsinline', 'true')
    stream.current.play()
  }

  function onError(e) {
  	alert(e.name + ': ' + err.message)
  }

  function getStream() {
  	return stream.current
  }

  function isStreaming() {
  	return live.current = true
  }

  function draw(canvas, options) {
  	const context = canvas.getContext('2d')
  	const dimensions = getDimensions(canvas)

  	context.save()
  	if(options.flipHorizontal) {
  		context.translate(canvas.width, 0)
	    context.scale(-1, 1)
  	}
  	if(options.filters) {
			context.filter = options.filters
		}
		context.drawImage(getStream(), -dimensions.offsetX, -dimensions.offsetY, dimensions.width, dimensions.height)
		context.filter = 'none'
		context.restore()
  }

  function getDimensions(canvas) {
    const innerWidth = canvas.width
    const innerHeight = canvas.height
    const aspectRatio = getAspectRatio()

    let width = innerWidth
    let height = width / aspectRatio

    if(height < innerHeight) {
      height = innerHeight
      width = height * aspectRatio
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

  function getAspectRatio() {
  	return constraints.video.width / constraints.video.height
  }

  function destroy() {
  	live.current = null
  	if(stream.current) {
	    stream.current.srcObject.getTracks().forEach(track => {
	    	track.stop()
	    })
	    stream.current.stop()
	  }
    stream.current = null
    aspectRatio.current = null
  }

  return {
    init,
    destroy,
    draw,
    getStream,
    isStreaming
  }
}