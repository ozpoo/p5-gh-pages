import { useRef } from 'react'
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export default function useBodyPose() {
  const source = useRef(null)
  const flipHorizontal = useRef(null)
  const canvas = useRef(null)
  const context = useRef(null)

  const bodyPoseRecognizer = useRef(null)

  const animationFrame = useRef(null)
  const lastTime = useRef(null)

  const data = useRef(null)
  const poses = useRef(null)

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
      bodyPoseRecognizer.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/task-vision/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        numPoses: 2,
        minHandDetectionConfidence: 0.7,
        minHandPresenceConfidence: 0.7,
        minTrackingConfidence: 0.7
      })

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
    bodyPoseRecognizer.current = null
    lastTime.current = null
    data.current = null
    poses.current = null
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
    if(!bodyPoseRecognizer.current) {
      throw new Error('call the loadDetector method first on this class before calling this')
    }

    const video = source.current
    
    if(video.currentTime !== lastTime.current) {
      lastTime.current = video.currentTime

      const poses = await bodyPoseRecognizer.current.detect(video, Date.now())

      data.current = poses
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

  function getPoses() {
    return poses.current || []
  }

  function drawCloud(_landmarks) {
    if(!canvas.current) {
      console.log('drawCloud(): no canvas was provided')
      return false
    }

    if(!_landmarks) {
      console.log('drawCloud(): no landmarks provided')
      return false
    }

    const landmarks = _landmarks
    context.current.fillStyle = 'blue'

    landmarks.forEach(point => {
      drawLandmark(point)
    })
  }

  function drawPoseCloud(_landmarks, _section) {
    if(!canvas.current) {
      console.log('drawPoseCloud(): no canvas was provided')
      return false
    }

    if(!_landmarks || !_section) {
      console.log('drawPoseCloud(): landmarks and a section must be provided')
      return false
    }

    const landmarks = _landmarks
    context.current.fillStyle = 'white'

    // const section = sectionInd[_finger]
    // finger.forEach(index => {
    //   drawLandmark(_hand, index)
    // })
  }

  function drawLandmark(_point) {
    if(!canvas.current) {
      console.log('drawLandmark(): no canvas was provided')
      return false
    }

    if(!_point) {
      console.log('drawLandmark(): not point provided')
      return false
    }

    context.current.fillStyle = 'white'

    const x = getX(_point)
    const y = getY(_point)

    context.current.moveTo(x, y)
    context.current.beginPath()

    context.current.arc(x, y, 2, 0, 2 * Math.PI)
    context.current.fill()
  }

  function drawSkeleton(_hand) {
    if(!canvas.current) {
      console.log('drawSkeleton(): no canvas was provided')
      return false
    }

    if(!_hand) {
      console.log('drawSkeleton(): a hand must be provided')
      return false
    }

    const { landmarks } = _hand
    context.current.strokeStyle = 'blue'
    Object.keys(fingerIndexes).forEach(finger => {
      drawPoseSkeleton(_hand, finger)
    })
  }

  function drawPoseSkeleton(_landmarks, _section) {
    if(!canvas.current) {
      console.log('drawPoseSkeleton(): no canvas was provided')
      return false
    }

    if(!_landmarks || !_section) {
      console.log('drawPoseSkeleton(): landmarks and a section must be provided')
      return false
    }

    const landmarks = _landmarks
    const section = sectionIndexes[_section]

    context.current.strokeStyle = 'blue'

    let x = getX(landmarks[section[0].start])
    let y = getY(landmarks[section[0].start])
    
    context.current.moveTo(x, y)
    context.current.beginPath()

    section.forEach(line => {
      const x = getX(landmarks[line.start])
      const y = getY(landmarks[line.start])
      context.current.lineTo(x, y)
      context.current.stroke()
    })

    const line = section[section.length - 1]
    x = getX(landmarks[line.end])
    y = getY(landmarks[line.end])

    context.current.lineTo(x, y)
    context.current.stroke()

    context.current.closePath()
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
    getPoses,
    drawCloud,
    drawPoseCloud,
    drawLandmark,
    drawSkeleton,
    drawPoseSkeleton
  }
}

const sectionIndexes = {
  left_eye: [
    PoseLandmarker.POSE_CONNECTIONS[0],
    PoseLandmarker.POSE_CONNECTIONS[1],
    PoseLandmarker.POSE_CONNECTIONS[2],
    PoseLandmarker.POSE_CONNECTIONS[3],
  ],
  right_eye: [
    PoseLandmarker.POSE_CONNECTIONS[4],
    PoseLandmarker.POSE_CONNECTIONS[5],
    PoseLandmarker.POSE_CONNECTIONS[6],
    PoseLandmarker.POSE_CONNECTIONS[7],
  ],
  mouth: [
    PoseLandmarker.POSE_CONNECTIONS[8]
  ]
}

const poseIndexes = {
  nose: 0,
  left_eye_inner: 1,
  left_eye: 2,
  left_eye_outer: 3,
  right_eye_inner: 4,
  right_eye: 5,
  right_eye_outer: 6,
  left_ear: 7,
  right_ear: 8,
  mouth_left: 9,
  mouth_right: 10,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_pinky: 17,
  right_pink: 18,
  left_index: 19,
  right_index: 20,
  left_thumb: 21,
  right_thumb: 22,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
  left_heel: 20,
  right_heel: 30,
  left_foot_index: 31,
  right_foot_index: 32
}