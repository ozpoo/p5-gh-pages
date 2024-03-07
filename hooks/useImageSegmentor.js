import { useRef } from 'react'
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision'

export default function useImageSegmentor() {
  const source = useRef(null)
  const flipHorizontal = useRef(null)
  const canvas = useRef(null)
  const context = useRef(null)

  const imageSegmentor = useRef(null)
  const labels = useRef(null)

  const animationFrame = useRef(null)
  const lastTime = useRef(null)

  const data = useRef(null)
  const hands = useRef(null)

  const callback = useRef(null)

  async function init(props) {
    if(!props.source) {
      console.log('init(): a source must be provided')
      return false
    }

  	return new Promise(async resolve => {
      source.current = props.source
      source.current.aspectRatio = props.source.videoWidth / props.source.videoHeight
      flipHorizontal.current = props.flipHorizontal || false

      canvas.current = props.canvas || false
      context.current = props.canvas?.getContext('2d')

      callback.current = props.callback || false

      onResize()

      const vision = await FilesetResolver.forVisionTasks('/models/task-vision/wasm')
      imageSegmentor.current = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-assets/deeplabv3.tflite?generation=1661875711618421',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        outputCategoryMask: true,
        outputConfidenceMasks: true
      })

      labels.current = imageSegmentor.current.getLabels()

      addListeners()
      resolve(true)
	  })
  }

  function addListeners() {
    window.addEventListener('resize', onResize)
  }

  function removeListeners() {
    if(animationFrame.current) cancelAnimationFrame(animationFrame.current)
    animationFrame.current = null
    window.removeEventListener('resize', onResize)
  }

  function onError(e) {
  	alert(e.name + ': ' + err.message)
  }

  function destroy() {
    removeListeners()
    source.current = null
    flipHorizontal.current = null
    canvas.current = null
    context.current = null
    imageSegmentor.current = null
    signRecognizer.current = null
    lastTime.current = null
    data.current = null
    hands.current = null
    callback.current = null
  }

  function onResize() {
    const _width = window.innerWidth
    const _height = window.innerHeight

    let width = _width
    let height = _width / source.current.aspectRatio

    if(height < _height) {
      height = _height
      width = height * source.current.aspectRatio
    }

    const offsetX = (width - _width) / 2
    const offsetY = (height - _height) / 2

    source.current.offsetX = offsetX
    source.current.offsetY = offsetY
  }

  async function detect() {
    if(!imageSegmentor.current) {
      throw new Error('call the loadDetector method first on this class before calling this')
    }

    const video = source.current
    
    if(video.currentTime !== lastTime.current) {
      lastTime.current = video.currentTime

      const segments = await imageSegmentor.current.segmentForVideo(video, Date.now())

      data.current = segments
    }

    if(callback.current) {
      callback.current(data.current)
    }

    animationFrame.current = requestAnimationFrame(() => {
      detect()
    })
  }

  function getData() {
    return data.current || []
  }

  function getSegments() {
    return data.current || []
  }

  function drawSegments() {
    const { videoWidth, videoHeight } = source.current

    let imageData = context.current.getImageData(
      0,
      0,
      videoWidth,
      videoHeight
    ).data

    const mask = data.current.categoryMask.getAsFloat32Array()

    let j = 0
    for(let i = 0; i < mask.length; ++i) {
      const maskVal = Math.round(mask[i] * 255.0)
      const legendColor = legendColors[maskVal % legendColors.length]
      imageData[j] = (legendColor[0] + imageData[j]) / 2
      imageData[j + 1] = (legendColor[1] + imageData[j + 1]) / 2
      imageData[j + 2] = (legendColor[2] + imageData[j + 2]) / 2
      imageData[j + 3] = (legendColor[3] + imageData[j + 3]) / 2
      j += 4
    }
    const uint8Array = new Uint8ClampedArray(imageData.buffer)
    context.current.putImageData(new ImageData(
      uint8Array,
      videoWidth,
      videoHeight
    ), 0, 0)
  }

  function getX(point) {
    const x = point.x * source.current.videoWidth
    if(flipHorizontal.current) {
      return map(x, 0, source.current.videoWidth, window.innerWidth + source.current.offsetX, -source.current.offsetX)
    } else {
      return map(x, 0, source.current.videoWidth, -source.current.offsetX, window.innerWidth + source.current.offsetX)
    }
  }

  function getY(point) {
    const y = point.y * source.current.videoHeight
    return map(y, 0, source.current.videoHeight, -source.current.offsetY, window.innerHeight + source.current.offsetY)
  }

  function map(value, in_min, in_max, out_min, out_max) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
  }

  function getDistance(_a, _b) {
    const x = _a.x - _b.x
    const y = _a.y - _b.y
    const z = _a.z - _b.z
    return Math.sqrt(x * x + y * y + z * z)
  }

  function getCenter(_points) {
    const x = _points.reduce((a, b) => a + b.x, 0) / _points.length
    const y = _points.reduce((a, b) => a + b.y, 0) / _points.length
    const z = _points.reduce((a, b) => a + (b.z || 0), 0) / _points.length

    return { x, y, z }
  }

  return {
    init,
    destroy,
    detect,
    getData,
    drawSegments,
    getSegments
  }
}

const legendColors = [
  [255, 197, 0, 255], // Vivid Yellow
  [128, 62, 117, 255], // Strong Purple
  [255, 104, 0, 255], // Vivid Orange
  [166, 189, 215, 255], // Very Light Blue
  [193, 0, 32, 255], // Vivid Red
  [206, 162, 98, 255], // Grayish Yellow
  [129, 112, 102, 255], // Medium Gray
  [0, 125, 52, 255], // Vivid Green
  [246, 118, 142, 255], // Strong Purplish Pink
  [0, 83, 138, 255], // Strong Blue
  [255, 112, 92, 255], // Strong Yellowish Pink
  [83, 55, 112, 255], // Strong Violet
  [255, 142, 0, 255], // Vivid Orange Yellow
  [179, 40, 81, 255], // Strong Purplish Red
  [244, 200, 0, 255], // Vivid Greenish Yellow
  [127, 24, 13, 255], // Strong Reddish Brown
  [147, 170, 0, 255], // Vivid Yellowish Green
  [89, 51, 21, 255], // Deep Yellowish Brown
  [241, 58, 19, 255], // Vivid Reddish Orange
  [35, 44, 22, 255], // Dark Olive Green
  [0, 161, 194, 255] // Vivid Blue
]