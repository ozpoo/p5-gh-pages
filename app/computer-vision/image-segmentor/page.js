'use client'

import { useEffect, useRef, useState } from 'react'

import { useWebcam, useImageSegmentor } from '@/hooks'

export default function ImageSegmentorSketch() {
	const mounted = useRef(null)

	const webcam = useWebcam()
	const imageSegmentor = useImageSegmentor()

	const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [segments, setSegments] = useState(false)

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
		await imageSegmentor.init({
			source: webcam.getStream(),
			canvas: canvasRef.current,
			flipHorizontal: true,
			callback: (e) => {
				console.log('cb', e)
				drawVideo()
				detectSegments()
			}
		})

		imageSegmentor.detect()
		window.addEventListener('resize', onResize)
	}

	function destroy() {
  	mounted.current = false
		window.removeEventListener('resize', onResize)
		
		if(imageSegmentor) imageSegmentor.destroy()
  	if(webcam.stream) webcam.destroy()
  }

  async function detectSegments() {
  	imageSegmentor.drawSegments()
  }

  function drawVideo() {
  	webcam.draw(canvasRef.current, {
  		flipHorizontal: true,
  		filters: 'grayscale() blur(4px) brightness(20%)'
  	})
  }

  return (
  	<div className='min-h-screen w-screen'>
{/*  		{leftHands?.length > 0 &&
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
*/}  		<canvas ref={canvasRef} className='absolute top-0 left-0 pointer-events-none' />
		</div>
	)
}