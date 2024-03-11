'use client'

import { useEffect, useRef, useState } from 'react'

import { useWebcam, useHandGesture } from '@/hooks'

export const routemetadata = {
  title: 'Hand Gesture'
}

export default function HandPoseSketch() {
	const mounted = useRef(null)

	const webcam = useWebcam()
	const handGesture = useHandGesture()

	const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // const animationFrameRef = useRef(null)

  const [hands, setHands] = useState(false)
  const [leftHands, setLeftHands] = useState(false)
  const [rightHands, setRightHands] = useState(false)

  useEffect(() => {
  	init()
  	return () => {
  		destroy()
  	}
  }, [])

  function onResize() {
  	resizeCanvas()
  }

  function resizeCanvas() {
  	canvasRef.current.width = window.innerWidth
  	canvasRef.current.height = window.innerHeight
  }

  async function init() {
  	mounted.current = true
  	resizeCanvas()

  	await webcam.init()
		await handGesture.init({
			source: webcam.getStream(),
			canvas: canvasRef.current,
			flipHorizontal: true,
			callback: (e) => {
				console.log('cb', e)
				drawVideo()
				detectHands()
			}
		})

		handGesture.detect()
		window.addEventListener('resize', onResize)
	}

	function destroy() {
  	mounted.current = false
		window.removeEventListener('resize', onResize)
		
		if(handGesture) handGesture.destroy()
  	if(webcam.stream) webcam.destroy()
  }

  async function detectHands() {
  	const data = handGesture.getHands()

		data.forEach(hand => {
			drawSkeleton(hand)
			drawCloud(hand)
		})

		setHands(data)
		setLeftHands(handGesture.getLeftHands())
		setRightHands(handGesture.getRightHands())
  }

  function drawVideo() {
  	webcam.draw(canvasRef.current, {
  		flipHorizontal: true,
  		filters: 'grayscale() blur(4px) brightness(20%)'
  	})
  }

  function drawCloud(_hand) {
  	drawFingerCloud(_hand)
  	// drawFingerCloud(_hand, 'thumb')
  }

  function drawSkeleton(_hand) {
  	drawFingerSkeleton(_hand)
		// drawFingerSkeleton(_hand, 'thumb')
  }

	function drawFingerCloud(_hand, _finger) {
		handGesture.drawCloud(_hand)
		// handGesture.drawFingerCloud(_hand, _finger)
	}

	function drawFingerSkeleton(_hand, _finger) {
		handGesture.drawSkeleton(_hand)
		// handGesture.drawFingerSkeleton(_hand, _finger)
	}

  return (
  	<div className='min-h-screen w-screen'>
  		{leftHands?.length > 0 &&
	  		<div className='absolute top-6 left-6 text-sm z-10'>
	  			{leftHands.map((hand, i) =>
	  				<p key={hand.handedness.categoryName + '-gestures-' + i}>{hand.gestures.map(g => g.categoryName).join(' ')}</p>
					)}
					{leftHands.map((hand, i) =>
	  				<p key={hand.handedness.categoryName + '-signs-' + i}>{hand.signs.map(g => g.categoryName).join(' ')}</p>
					)}
	  		</div>
	  	}
	  	{rightHands?.length > 0 &&
	  		<div className='absolute top-6 right-6 text-sm z-10'>
	  			{rightHands.map((hand, i) =>
	  				<p key={hand.handedness.categoryName + '-gestures-' + i}>{hand.gestures.map(g => g.categoryName).join(' ')}</p>
					)}
					{rightHands.map((hand, i) =>
	  				<p key={hand.handedness.categoryName + '-signs-' + i}>{hand.signs.map(g => g.categoryName).join(' ')}</p>
					)}
	  		</div>
	  	}
  		<canvas ref={canvasRef} className='absolute top-0 left-0 pointer-events-none' />
		</div>
	)
}