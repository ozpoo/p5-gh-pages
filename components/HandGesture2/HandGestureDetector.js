import {
  GestureRecognizer,
  FilesetResolver
} from '@mediapipe/tasks-vision'

export default class HandGestureDetector {
  constructor(props) {
    this.data = []

    this.source = props.source

    this.canvas = props.canvas
    this.context = this.canvas.getContext('2d')

    this.data = null
    this.hands = null

    this.flipHorizontal = props.flipHorizontal

    this.sourceOffsetX = null
    this.sourceOffsetY = null

    this.aspectRatio = this.source.videoWidth / this.source.videoHeight
    
    this.attachListeners = this.attachListeners.bind(this)
    this.onResize = this.onResize.bind(this)
    
    this.gestureDetector = null
    this.signDetector = null

    this.lastTime = -0

    this.animationFrame = null

    this.onResize()
    this.attachListeners()
  }

  attachListeners() {
    window.addEventListener('resize', this.onResize)
  }

  detachListeners() {
    window.removeEventListener('resize', this.onResize)
  }

  async load() {
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm')
    this.gestureDetector = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: 'GPU'
      },
      numHands: 2,
      runningMode: 'VIDEO'
    })
    // await this.gestureDetector.setOptions({ runningMode: 'VIDEO' })
    this.signDetector = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/task/sign_language_recognizer.task',
        delegate: 'GPU'
      },
      numHands: 2,
      runningMode: 'VIDEO'
    })
    // await this.signDetector.setOptions({ runningMode: 'VIDEO' })
  }

  async detect() {
    if(!this.gestureDetector || !this.signDetector) {
      throw new Error('call the loadDetector method first on this class before calling this')
    }

    const video = this.source
    
    if(video.currentTime !== this.lastTime) {
      this.lastTime = video.currentTime

      const gestures = await this.gestureDetector.recognizeForVideo(video, Date.now())
      const signs = await this.signDetector.recognizeForVideo(video, Date.now())

      this.data = {
        ...gestures,
        signs: signs.gestures
      }

      const components = Object.keys(this.data)

      this.hands = this.data.gestures.map((g, i) => {
        const hand = {}
        components.forEach(key => {
          hand[key] = this.data[key][i]
        })
        delete hand.handednesses
        hand.handedness = hand.handedness[0]
        return hand
      })
    }

    this.animationFrame = requestAnimationFrame(() => {
      this.detect()
    })
  }

  getData() {
    return this.data
  }

  getHands() {
    return this.hands || []
  }

  getLeftHands() {
    return this.hands ? this.hands.filter(hand => hand.handedness.categoryName === 'Left') : []
  }

  getRightHands() {
    return this.hands ? this.hands.filter(hand => hand.handedness.categoryName === 'Right') : []
  }

  onResize() {
    const _width = window.innerWidth
    const _height = window.innerHeight

    let width = _width
    let height = _width / this.aspectRatio

    if(height < _height) {
      height = _height
      width = height * this.aspectRatio
    }

    const offsetX = (width - _width) / 2
    const offsetY = (height - _height) / 2

    this.sourceOffsetX = offsetX
    this.sourceOffsetY = offsetY

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  drawCloud(_hand) {
    const { landmarks } = _hand
    this.context.fillStyle = 'blue'

    Object.keys(fingerIndexes).forEach(findex => {
      const finger = fingerIndexes[findex]
      finger.forEach(index => {
        this.drawLandmark(_hand, index)
      })
    })
  }

  drawFingerCloud(_hand, _finger) {
    const { landmarks } = _hand
    this.context.fillStyle = 'white'

    const finger = fingerIndexes[_finger]
    finger.forEach(index => {
      this.drawLandmark(_hand, index)
    })
  }

  drawLandmark(_hand, _index) {
    const { landmarks } = _hand
    this.context.fillStyle = 'white'

    const point = landmarks[_index]
    const x = getX(point, this)
    const y = getY(point, this)

    this.context.moveTo(x, y)
    this.context.beginPath()

    this.context.arc(x, y, 2, 0, 2 * Math.PI)
    this.context.fill()
  }

  drawSkeleton(_hand) {
    const { landmarks } = _hand
    this.context.strokeStyle = 'blue'
    Object.keys(fingerIndexes).forEach(finger => {
      this.drawFingerSkeleton(_hand, finger)
    })
  }

  drawFingerSkeleton(_hand, _finger) {
    const { landmarks } = _hand
    this.context.strokeStyle = 'blue'

    const finger = fingerIndexes[_finger]
    const x = getX(landmarks[finger[0]], this)
    const y = getY(landmarks[finger[0]], this)
    
    this.context.moveTo(x, y)
    this.context.beginPath()

    finger.forEach((point) => {
      const x = getX(landmarks[point], this)
      const y = getY(landmarks[point], this)
      this.context.lineTo(x, y)
      this.context.stroke()
    })

    this.context.closePath()
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

  destroy() {
    if(this.animationFrame) cancelAnimationFrame(this.animationFrame)
    this.detachListeners()
    this.animationFrame = null
    this.data = null
    this.source = null
    this.canvas = null
    this.context = null
    this.gestureDetector = null
    this.gestureDetectorConfig = null
    this.signDetector = null
    this.signDetectorConfig = null
    this.sourceOffsetX = null
    this.sourceOffsetY = null
    this.attachListeners = null
    this.onResize = null
  }
}

function getX(point, _this) {
  const x = point.x * _this.source.videoWidth
  if(_this.flipHorizontal) {
    return map(x, 0, _this.source.videoWidth, window.innerWidth + _this.sourceOffsetX, -_this.sourceOffsetX)
  } else {
    return map(x, 0, _this.source.videoWidth, -_this.sourceOffsetX, window.innerWidth + _this.sourceOffsetX)
  }
}

function getY(point, _this) {
  const y = point.y * _this.source.videoHeight
  return map(y, 0, _this.source.videoHeight, -_this.sourceOffsetY, window.innerHeight + _this.sourceOffsetY)
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