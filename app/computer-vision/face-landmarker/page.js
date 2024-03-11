'use client'

import { useEffect, useRef, useState } from 'react'

import WebCam from '@/components/WebCam/WebcamCanvas'
import FaceLandmark from '@/components/FaceLandmark/FaceLandmarkDetector'

export const routemetadata = {
  title: 'Face Landmarker'
}

export default function HandPoseSketch() {
  const containerRef = useRef(null)
  const webCam = useRef(null)
  const faceLandmark = useRef(null)
  const animationFrame = useRef(null)

  const [hands, setHands] = useState(false)

  useEffect(() => {
  	init()
  	return () => {
  		destroy()
  	}
  }, [])

  async function init() {
  	webCam.current = new WebCam()
		faceLandmark.current = new FaceLandmark({
			source: webCam.current,
			canvas: containerRef.current,
			flipHorizontal: true
		})

		await faceLandmark.current.loadDetector()
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
  	const data = await faceLandmark.current.detectLandmarks(webCam.current.canvas)
  	const { faceLandmarks } = data

  	console.log(data)

  	faceLandmarks.forEach(landmark => {
  		drawCloud(landmark)
			drawSkeleton(landmark)
  	})

  	if(data.length) {
			setHands(landmark)
		} else {
			setHands(false)
		}
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
		faceLandmark.current.drawPoint(_point)
	}

	function drawFingerCloud(_hand, _finger) {
		faceLandmark.current.drawCloud(_hand, _finger)
	}

	function drawFingerSkeleton(_hand, _finger) {
		faceLandmark.current.drawSkeleton(_hand, _finger)
	}

	function destroy() {
		if(animationFrame.current) cancelAnimationFrame(animationFrame.current)
		if(faceLandmark.current) {
			faceLandmark.current.destroy()
  		faceLandmark.current = null
  	}
  	if(faceLandmark.current) {
  		webCam.current.destroy()
  		webCam.current = null
  	}
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