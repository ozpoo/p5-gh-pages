import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-converter'
import '@tensorflow/tfjs-backend-webgl'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'

export default class HandGestureDetector {
  constructor(props) {
    this.data = []

    this.source = props.source

    this.flipHorizontal = props.flipHorizontal

    this.canvas = props.canvas
    this.context = this.canvas.getContext('2d')

    this.model = handPoseDetection.SupportedModels.MediaPipeHands
    this.detector = null
    this.detectorConfig = {
      runtime: 'mediapipe',
      modelType: 'full',
      refineLandmarks: true,
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
    }

    this.sourceOffsetX = null
    this.sourceOffsetY = null
    
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

  async loadDetector() {
    await tf.ready()
    this.detector = await handPoseDetection.createDetector(
      this.model,
      this.detectorConfig
    )
  }

  async detectHands() {
    if(!this.detector) {
      throw new Error('call the loadDetector method first on this class before calling this')
    }
    this.data = await this.detector.estimateHands(this.source.canvas, {
      flipHorizontal: true
    })
    return this.data || []
  }

  onResize() {
    const _width = window.innerWidth
    const _height = window.innerHeight

    let width = _width
    let height = _width / this.source.aspectRatio

    if(height < _height) {
      height = _height
      width = height * this.source.aspectRatio
    }

    const offsetX = (width - _width) / 2
    const offsetY = (height - _height) / 2

    this.sourceOffsetX = offsetX
    this.sourceOffsetY = offsetY

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  drawCloud(_hand, _finger) {
    this.context.fillStyle = 'blue'

    const finger = fingerIndexes[_finger]

    finger.forEach(point => {
      this.context.beginPath()
      const x = getX(_hand.keypoints[point], this)
      const y = getY(_hand.keypoints[point], this)
      this.context.arc(x, y, 4, 0, 2 * Math.PI)
      this.context.fill()
    })
  }

  drawSkeleton(_hand, _finger) {
    this.context.strokeStyle = 'blue'

    const finger = fingerIndexes[_finger]
    const x = getX(_hand.keypoints[finger[0]], this)
    const y = getY(_hand.keypoints[finger[0]], this)

    console.log(x, y)
    
    this.context.moveTo(x, y)
    this.context.beginPath()

    finger.forEach((point) => {
      const x = getX(_hand.keypoints[point], this)
      const y = getY(_hand.keypoints[point], this)
      this.context.lineTo(x, y)
      this.context.stroke()
    })

    this.context.closePath()
  }

  drawPoint(_point) {
    this.context.fillStyle = 'yellow'

    const x = getX(_point, this)
    const y = getY(_point, this)

    console.log('point', x, y)

    this.context.moveTo(x, y)
    this.context.beginPath()

    this.context.arc(x, y, 8, 0, 2 * Math.PI)
    this.context.fill()
  }

  getGestures(_keypoints) {
    const gestures = []

    if(_keypoints.length) {
      const fist = this.checkFist(_keypoints)
      const thumbs_up = this.checkThumbsUp(_keypoints)
      const pinch = this.checkPinch(_keypoints)

      if(fist.found) {
        gestures.push(fist)
      } else if(thumbs_up.found) {
        gestures.push(thumbs_up)
      } else if(pinch.found) {
        gestures.push(pinch)
      }
    }

    return gestures
  }

  checkFist(_keypoints) {
    const threshold = 60
    const keypoints = _keypoints

    const thumb = getDistance(keypoints[tipIndexes.thumb_tip], keypoints[tipIndexes.index_finger_pip])
    const index = getDistance(keypoints[tipIndexes.index_finger_tip], keypoints[tipIndexes.index_finger_mcp])
    const middle = getDistance(keypoints[tipIndexes.middle_finger_tip], keypoints[tipIndexes.middle_finger_mcp])
    const ring = getDistance(keypoints[tipIndexes.ring_finger_tip], keypoints[tipIndexes.ring_finger_mcp])
    const pinky = getDistance(keypoints[tipIndexes.pinky_finger_tip], keypoints[tipIndexes.pinky_finger_mcp])

    const max = Math.max(thumb, index, middle, ring, pinky)

    return {
      type: 'fist',
      found: max < threshold,
      score: map(max, 0, threshold, 1, 0)
    }
  }

  checkPinch(_keypoints) {
    const threshold = 80
    const keypoints = _keypoints

    const pinch = getDistance(keypoints[tipIndexes.thumb_tip], keypoints[tipIndexes.index_finger_pip])
    const pinchPoint = getCenter([keypoints[tipIndexes.thumb_tip], keypoints[tipIndexes.index_finger_tip]])

    const middle = getDistance(keypoints[tipIndexes.middle_finger_tip], keypoints[tipIndexes.middle_finger_mcp])
    const ring = getDistance(keypoints[tipIndexes.ring_finger_tip], keypoints[tipIndexes.ring_finger_mcp])
    const pinky = getDistance(keypoints[tipIndexes.pinky_finger_tip], keypoints[tipIndexes.pinky_finger_mcp])

    const max = Math.max(middle, ring, pinky)

    return {
      type: 'pinch',
      found: max < threshold && pinch < 50,
      score: map(max, 0, threshold, 1, 0),
      point: pinchPoint
    }
  }

  checkThumbsUp(_keypoints) {
    const threshold = 60
    const keypoints = _keypoints

    const thumb = getDistance(keypoints[tipIndexes.thumb_tip], keypoints[tipIndexes.index_finger_pip])

    const index = getDistance(keypoints[tipIndexes.index_finger_tip], keypoints[tipIndexes.index_finger_mcp])
    const middle = getDistance(keypoints[tipIndexes.middle_finger_tip], keypoints[tipIndexes.middle_finger_mcp])
    const ring = getDistance(keypoints[tipIndexes.ring_finger_tip], keypoints[tipIndexes.ring_finger_mcp])
    const pinky = getDistance(keypoints[tipIndexes.pinky_finger_tip], keypoints[tipIndexes.pinky_finger_mcp])

    const max = Math.max(index, middle, ring, pinky)

    return {
      type: 'thumbs_up',
      found: max < threshold && thumb > 90,
      score: 0
    }
  }

  destroy() {
    this.detachListeners()
    this.data = null
    this.source = null
    this.canvas = null
    this.context = null
    this.model = null
    this.detector = null
    this.detectorConfig = null
    this.sourceOffsetX = null
    this.sourceOffsetY = null
    this.attachListeners = null
    this.onResize = null
  }
}

function getX(point, _this) {
  const x = point.x
  return map(x, 0, _this.source.canvas.width, -_this.sourceOffsetX, window.innerWidth + _this.sourceOffsetX)
}

function getY(point, _this) {
  const y = point.y
  return map(y, 0, _this.source.canvas.height, -_this.sourceOffsetY, window.innerHeight + _this.sourceOffsetY)
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

const tipIndexes = {
  wrist: 0,

  thumb_cmc: 1,
  thumb_mcp: 2,
  thumb_ip: 3,
  thumb_tip: 4,

  index_finger_mcp: 5,
  index_finger_pip: 6,
  index_finger_dip: 7,
  index_finger_tip: 8,

  middle_finger_mcp: 9,
  middle_finger_pip: 10,
  middle_finger_dip: 11,
  middle_finger_tip: 12,

  ring_finger_mcp: 13,
  ring_finger_pip: 14,
  ring_finger_dip: 15,
  ring_finger_tip: 16,

  pinky_finger_mcp: 17,
  pinky_finger_pip: 18,
  pinky_finger_dip: 19,
  pinky_finger_tip: 20
}

const fingerIndexes = {
  thumb: [0, 1, 2, 3, 4],
  index_finger: [0, 5, 6, 7, 8],
  middle_finger: [0, 9, 10, 11, 12],
  ring_finger: [0, 13, 14, 15, 16],
  pinky_finger: [0, 17, 18, 19, 20]
}