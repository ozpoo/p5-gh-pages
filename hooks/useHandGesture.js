import { useRef } from 'react'
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision'

export default function useHandGesture() {
  const source = useRef(null)
  const flipHorizontal = useRef(null)
  const canvas = useRef(null)
  const context = useRef(null)

  const gestureRecognizer = useRef(null)
  const signRecognizer = useRef(null)

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
      gestureRecognizer.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/task-vision/gesture_recognizer.task',
          delegate: 'GPU'
        },
        numHands: 2,
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.7,
        minHandPresenceConfidence: 0.7,
        minTrackingConfidence: 0.7
      })

      signRecognizer.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/task-vision/sign_language_recognizer.task',
          delegate: 'GPU'
        },
        numHands: 2,
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.7,
        minHandPresenceConfidence: 0.7,
        minTrackingConfidence: 0.7,
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
    gestureRecognizer.current = null
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
    if(!gestureRecognizer.current || !signRecognizer.current) {
      throw new Error('call the loadDetector method first on this class before calling this')
    }

    const video = source.current
    
    if(video.currentTime !== lastTime.current) {
      lastTime.current = video.currentTime

      const gestures = await gestureRecognizer.current.recognizeForVideo(video, Date.now())
      const signs = await signRecognizer.current.recognizeForVideo(video, Date.now())

      data.current = {
        ...gestures,
        signs: signs.gestures
      }

      const components = Object.keys(data.current)

      hands.current = data.current.gestures.map((g, i) => {
        const hand = {}

        components.forEach(key => {
          hand[key] = data.current[key][i]
        })

        hand.signs = data.current.signs[i] || []
        hand.handedness = hand.handedness[0] || 'None'
        delete hand.handednesses

        return hand
      })

      // checkCustomGestures()
    }

    if(callback.current) {
      callback.current(data.current)
    }

    animationFrame.current = requestAnimationFrame(() => {
      detect()
    })
  }

  function checkCustomGestures() {
    checkPinch()
  }

  function getData() {
    return data.current || []
  }

  function getHands() {
    return hands.current || []
  }

  function getLeftHands() {
    if(!hands.current) {
      console.log('getLeftHands(): no hands detected')
      return []
    }
    const leftHands = hands.current.filter(hand => hand.handedness.categoryName === 'Left')
    return leftHands || []
  }

  function getRightHands() {
    if(!hands.current) {
      console.log('getRightHands(): no hands detected')
      return []
    }
    const rightHands = hands.current.filter(hand => hand.handedness.categoryName === 'Right')
    return rightHands || []
  }

  function drawCloud(_hand) {
    if(!canvas.current) {
      console.log('drawCloud(): no canvas was provided')
      return false
    }

    if(!_hand) {
      console.log('drawCloud(): a hand must be provided')
      return false
    }

    const { landmarks } = _hand
    context.current.fillStyle = 'blue'

    Object.keys(fingerIndexes).forEach(findex => {
      const finger = fingerIndexes[findex]
      finger.forEach(index => {
        drawLandmark(_hand, index)
      })
    })
  }

  function drawFingerCloud(_hand, _finger) {
    if(!canvas.current) {
      console.log('drawFingerCloud(): no canvas was provided')
      return false
    }

    if(!_hand || !_finger) {
      console.log('drawFingerCloud(): a hand and finger must be provided')
      return false
    }

    const { landmarks } = _hand
    context.current.fillStyle = 'white'

    const finger = fingerIndexes[_finger]
    finger.forEach(index => {
      drawLandmark(_hand, index)
    })
  }

  function drawLandmark(_hand, _index) {
    if(!canvas.current) {
      console.log('drawLandmark(): no canvas was provided')
      return false
    }

    if(!_hand || !(_index === 0 || _index)) {
      console.log('drawLandmark(): a hand and index must be provided')
      return false
    }

    const { landmarks } = _hand
    context.current.fillStyle = 'white'

    const point = landmarks[_index]
    const x = getX(point)
    const y = getY(point)

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
      drawFingerSkeleton(_hand, finger)
    })
  }

  function drawFingerSkeleton(_hand, _finger) {
    if(!canvas.current) {
      console.log('drawFingerSkeleton(): no canvas was provided')
      return false
    }

    if(!_hand || !_finger) {
      console.log('drawFingerSkeleton(): a hand and finger must be provided')
      return false
    }

    const { landmarks } = _hand
    context.current.strokeStyle = 'blue'

    const finger = fingerIndexes[_finger]
    const x = getX(landmarks[finger[0]])
    const y = getY(landmarks[finger[0]])
    
    context.current.moveTo(x, y)
    context.current.beginPath()

    finger.forEach((point) => {
      const x = getX(landmarks[point])
      const y = getY(landmarks[point])
      context.current.lineTo(x, y)
      context.current.stroke()
    })

    context.current.closePath()
  }

  function checkPinch(_hand) {
    if(!_hand) {
      console.log('checkPinch(): a hand must be provided')
      return false
    }

    const threshold = 80
    const landmarks = _landmarks

    const pinch = getDistance(landmarks[tipIndexes.thumb_tip], landmarks[tipIndexes.index_finger_pip])
    const pinchPoint = getCenter([landmarks[tipIndexes.thumb_tip], landmarks[tipIndexes.index_finger_tip]])

    const middle = getDistance(landmarks[tipIndexes.middle_finger_tip], landmarks[tipIndexes.middle_finger_mcp])
    const ring = getDistance(landmarks[tipIndexes.ring_finger_tip], landmarks[tipIndexes.ring_finger_mcp])
    const pinky = getDistance(landmarks[tipIndexes.pinky_finger_tip], landmarks[tipIndexes.pinky_finger_mcp])

    const max = Math.max(middle, ring, pinky)

    return {
      type: 'pinch',
      found: max < threshold && pinch < 50,
      score: map(max, 0, threshold, 1, 0),
      point: pinchPoint
    }
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
    getHands,
    getLeftHands,
    getRightHands,
    drawCloud,
    drawFingerCloud,
    drawLandmark,
    drawSkeleton,
    drawFingerSkeleton
  }
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