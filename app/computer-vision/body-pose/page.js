'use client'

import { useEffect, useRef } from 'react'

import WebcamCanvas from '@/components/WebCam/WebcamCanvas'
import BodyPoseDetector from '@/components/BodyPose/BodyPoseDetector'
import PointCloud from '@/components/BodyPose/PointCloud'

import { flattenBodyPoseArray, createBufferAttribute, createSkeletonBufferAttribute, getIndexes } from '@/components/BodyPose/utils'

import { useWebcam, useBodyPose } from '@/hooks'

export const routemetadata = {
  title: 'Body Pose'
}

export default function BodyPoseSketch() {
	const mounted = useRef(null)
  const canvasRef = useRef(null)

  const webcam = useWebcam()
  const bodyPose = useBodyPose()

  useEffect(() => {
		init()
    return () => {
    	destroy()
    }
  }, [])

  function onResize() {
  	resizeCanvas()
  }

  async function init() {
		mounted.current = true
  	resizeCanvas()

		await webcam.init()
		await bodyPose.init({
			source: webcam.getStream(),
			canvas: canvasRef.current,
			flipHorizontal: true,
			callback: (e) => {
				drawVideo()
				detectBody()
			}
		})

		bodyPose.detect()

		window.addEventListener('resize', onResize)
	}

	function resizeCanvas() {
  	canvasRef.current.width = window.innerWidth
  	canvasRef.current.height = window.innerHeight
  }

	function drawVideo() {
  	webcam.draw(canvasRef.current, {
  		flipHorizontal: true,
  		filters: 'grayscale() blur(4px) brightness(20%)'
  	})
  }

	async function detectBody() {
  	const bodies = await bodyPose.getData()

  	const { landmarks } = bodies

  	landmarks.forEach(pose => {
  		drawCloud(pose)
  		drawPoseSkeleton(pose, 'left_eye')
  		drawPoseSkeleton(pose, 'right_eye')
  	})
  }

  function drawCloud(_landmarks) {
  	bodyPose.drawCloud(_landmarks)
  }

  function drawPoseSkeleton(_landmarks, _section) {
  	bodyPose.drawPoseSkeleton(_landmarks, _section)
  }

  function destroy() {
  	mounted.current = false
    window.removeEventListener('resize', onResize)
    if(webcam.stream) webcam.destroy()
  }

  return (
    <canvas ref={canvasRef} className='absolute top-0 left-0 pointer-events-none' />
  )
}