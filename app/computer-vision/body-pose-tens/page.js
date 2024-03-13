'use client'

import { useEffect, useRef } from 'react'
import { useWebcam, useBodyPoseTens as useBodyPose } from '@/hooks'

export const routemetadata = {
  title: 'Body Pose Tensor'
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

    bodies.forEach(body => {
      drawCloud(body.keypoints)
      drawSkeleton(body.keypoints, 'left_eye')
      drawPoseSkeleton(body.keypoints, 'left_eye')
    })
  }

  function drawCloud(_landmarks) {
    bodyPose.drawCloud(_landmarks)
  }

  function drawSkeleton(_landmarks) {
    bodyPose.drawSkeleton(_landmarks)
  }

  function drawPoseSkeleton(_landmarks, _section) {
    bodyPose.drawPoseSkeleton(_landmarks, _section)
  }

  function destroy() {
    mounted.current = false
    bodyPose.destroy()
    webcam.destroy()
    window.removeEventListener('resize', onResize)
  }

  return (
    <canvas ref={canvasRef} className='absolute top-0 left-0 pointer-events-none' />
  )
}