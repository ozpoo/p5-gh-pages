'use client'

import { useEffect, useRef, useState } from 'react'

import WebCam from '../components/WebCam/WebcamCanvas'
import HandGesture from '../components/HandGesture/HandGestureDetector'

export default function HandPoseSketch() {
  const containerRef = useRef(null)
  const webCam = useRef(null)
  const handGesture = useRef(null)
  const animationFrame = useRef(null)

  const [hands, setHands] = useState(false)

  useEffect(() => {
  	init()
  	return () => {
  		if(animationFrame.current) cancelAnimationFrame(animationFrame.current)
  		if(handGesture.current) {
  			handGesture.current.destroy()
	  		handGesture.current = null
	  	}
	  	if(handGesture.current) {
	  		webCam.current.destroy()
	  		webCam.current = null
	  	}
  	}
  }, [])

  async function init() {
  	webCam.current = new WebCam()
		handGesture.current = new HandGesture({
			source: webCam.current,
			canvas: containerRef.current,
			flipHorizontal: true
		})

		await handGesture.current.loadDetector()
		animate()
	}

	function animate() {
		if(webCam.current.live) {
			webCam.current.update()
			drawVideo()
			detectHands()
		}

		animationFrame.current = requestAnimationFrame(animate)
	}

  async function detectHands() {
  	const data = await handGesture.current.detectHands(webCam.current.canvas)
  	const components = Object.keys(data)

  	data.forEach(hand => {
  		drawCloud(hand)
			drawSkeleton(hand)
  	})

  	if(data.length) {
			setHands(data)
		} else {
			setHands(false)
		}

  	// const newHands = []
  	// data.gestures.forEach((g, i) => {
  	// 	const hand = {}
  	// 	components.forEach(key => {
  	// 		hand[key] = data[key][i]
  	// 	})
  	// 	delete hand.handednesses
  	// 	newHands.push(hand)
  	// })

		// newHands.forEach(hand => {
		// 	drawCloud(hand)
		// 	drawSkeleton(hand)
		// })

		// if(newHands.length) {
		// 	setHands(newHands)
		// } else {
		// 	setHands(false)
		// }
  }

  function drawVideo() {
  	const { canvas, dimensions } = webCam.current
  	const context = containerRef.current.getContext('2d')
  	context.save()
		context.translate(containerRef.current.width, 0)
    context.scale(-1, 1)
		context.filter = 'grayscale() blur(4px) brightness(20%)'
		context.drawImage(canvas, -dimensions.offsetX, -dimensions.offsetY, dimensions.width, dimensions.height)
		context.filter = 'none'
		context.restore()
  }

  function drawCloud(_hand) {
  	drawFingerCloud(_hand, 'thumb')
		drawFingerCloud(_hand, 'index_finger')
		drawFingerCloud(_hand, 'middle_finger')
		drawFingerCloud(_hand, 'ring_finger')
		drawFingerCloud(_hand, 'pinky_finger')
  }

  function drawSkeleton(_hand) {
		drawFingerSkeleton(_hand, 'thumb')
		drawFingerSkeleton(_hand, 'index_finger')
		drawFingerSkeleton(_hand, 'middle_finger')
		drawFingerSkeleton(_hand, 'ring_finger')
		drawFingerSkeleton(_hand, 'pinky_finger')
  }

  function drawFingerPoint(_point) {
		handGesture.current.drawPoint(_point)
	}

	function drawFingerCloud(_hand, _finger) {
		handGesture.current.drawCloud(_hand, _finger)
	}

	function drawFingerSkeleton(_hand, _finger) {
		handGesture.current.drawSkeleton(_hand, _finger)
	}

  return (
  	<div>
  		<div className='absolute top-6 right-6 text-sm z-10'>
  			{/*{hands && hands.map(hand =>
  				<p>{hand.gestures.map(g => g.categoryName).join(' ')}</p>
				)}*/}
  		</div>
  		<canvas ref={containerRef} className='absolute top-0 left-0 pointer-events-none' />
		</div>
	)
}