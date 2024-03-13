'use client'

import { useEffect, useRef, useState } from 'react'

import { useWebcam, useImageSegmentor } from '@/hooks'

export const routemetadata = {
  title: 'Image Segmentation'
}

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
				webcam.draw(canvasRef.current, {
		  		flipHorizontal: true,
		  		filters: 'grayscale() blur(4px) brightness(20%)'
		  	})
				imageSegmentor.drawSegments()
			}
		})

		imageSegmentor.detect()
		window.addEventListener('resize', onResize)
	}

	function destroy() {
  	mounted.current = false
		window.removeEventListener('resize', onResize)
		imageSegmentor.destroy()
  	webcam.destroy()
  }

  return (
  	<div className='min-h-screen w-screen'>
			<canvas ref={canvasRef} className='absolute top-0 left-0 pointer-events-none' />
		</div>
	)
}