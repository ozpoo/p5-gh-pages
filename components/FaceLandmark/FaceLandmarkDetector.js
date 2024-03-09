import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils
} from '@mediapipe/tasks-vision'

const {
  FACE_LANDMARKS_CONTOURS,
  FACE_LANDMARKS_FACE_OVAL,
  FACE_LANDMARKS_LEFT_EYE,
  FACE_LANDMARKS_LEFT_EYEBROW,
  FACE_LANDMARKS_LEFT_IRIS,
  FACE_LANDMARKS_RIGHT_EYE,
  FACE_LANDMARKS_RIGHT_EYEBROW,
  FACE_LANDMARKS_RIGHT_IRIS,
  FACE_LANDMARKS_TESSELATION
} = FaceLandmarker

export default class FaceLandmarkDetector {
  constructor(props) {
    this.detector = null

    this.source = props.source

    this.canvas = props.canvas
    this.context = this.canvas.getContext('2d')
    this.drawingUtils = new DrawingUtils(this.context)

    this.flipHorizontal = props.flipHorizontal

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
    console.log(FaceLandmarkDetector)
    const filesetResolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm')
    this.detector = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: 'IMAGE',
      numFaces: 2,
      output_face_blendshapes: true,
      // result_callback: () => {}
    })
  }

  async detectLandmarks() {
    if(!this.detector) return
    return await this.detector.detect(this.source.canvas)
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

  drawCloud(_landmarks, _feature) {
    // drawPoints(FACE_LANDMARKS_TESSELATION, _landmarks, this)

    const points = FACE_LANDMARKS_TESSELATION.map(l => l.start)
    points.push(FACE_LANDMARKS_TESSELATION[FACE_LANDMARKS_TESSELATION.length - 1].end)

    const landmarks = points.map(p => {
      const point = _landmarks[p] 
      return {
        x: getXL(point, this),
        y: getYL(point, this),
        z: point.z
      }
    })

    this.drawingUtils.drawLandmarks(
      landmarks,
      {
        color: '#0088FF',
        lineWidth: 0,
        radius: 1
      }
    )
  }

  drawSkeleton(_landmarks, _feature) {
   // drawLines(FACE_LANDMARKS_TESSELATION, _landmarks, this)
    const landmarks = _landmarks.map(point => {
      return {
        x: getXL(point, this),
        y: getYL(point, this),
        z: point.z
      }
    })

    this.drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_CONTOURS,
      {
        color: '#8800FF',
        lineWidth: 0.6
      }
    )
   }

   destroy() {
    this.detachListeners()
    this.detector = null
    this.source = null
    this.canvas = null
    this.context = null
    this.drawingUtils = null
    this.flipHorizontal = null
    this.sourceOffsetX = null
    this.sourceOffsetY = null
    this.attachListeners = null
    this.onResize = null
   }
}

// source pixels
function getX(point, _this) {
  const x = point.x * _this.source.canvas.width
  if(_this.flipHorizontal) {
    return map(x, 0, _this.source.canvas.width, window.innerWidth + _this.sourceOffsetX, -_this.sourceOffsetX)
  } else {
    return map(x, 0, _this.source.canvas.width, -_this.sourceOffsetX, window.innerWidth + _this.sourceOffsetX)
  }
}

// 0 - 1
function getXL(point, _this) {
  const x = point.x
  const offsetX = _this.sourceOffsetX / window.innerWidth
  console.log(offsetX)
  if(_this.flipHorizontal) {
    return map(x, 0, 1, 1 + offsetX, -offsetX)
  } else {
    return map(x, 0, 1, -offsetX, 1 + offsetX)
  }
}

// source pixels
function getY(point, _this) {
  const y = point.y * _this.source.canvas.height
  return map(y, 0, _this.source.canvas.height, -_this.sourceOffsetY, window.innerHeight + _this.sourceOffsetY)
}

// 0 - 1
function getYL(point, _this) {
  const y = point.y
  const offsetY = _this.sourceOffsetY / window.innerHeight
  return map(y, 0, 1, -offsetY, 1 + offsetY)
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

function drawPoints(_points, _landmarks, _this) {
  _this.context.fillStyle = 'blue'

  const points = _points.map(l => l.start)
  points.push(_points[_points.length - 1].end)

  points.forEach(p => {
    const point = _landmarks[p] 
    _this.context.beginPath()
    const x = getX(point, _this)
    const y = getY(point, _this)
    _this.context.arc(x, y, 2, 0, 2 * Math.PI)
    _this.context.fill()
  })
}

function drawLines(_points, _landmarks, _this) {
  _this.context.strokeStyle = 'blue'

  const points = _points.map(l => l.start)
  points.push(_points[_points.length - 1].end)

  const x = getX(points[0], _this)
  const y = getY(points[0], _this)
  
  _this.context.moveTo(x, y)
  _this.context.beginPath()

  points.forEach(p => {
    const point = _landmarks[p] 
    const x = getX(point, _this)
    const y = getY(point, _this)
    _this.context.lineTo(x, y)
    _this.context.stroke()
  })

  _this.context.closePath()
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