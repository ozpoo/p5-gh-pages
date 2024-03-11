'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as faceapi from 'face-api.js'

export const routemetadata = {
  title: 'Face API'
}

export default function ToneJSSKetch() {
	const mounted = useRef(null)
  const containerRef = useRef(null)

  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const videoHeight = 480
  const videoWidth = 640

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [captureVideo, setCaptureVideo] = useState(false)

  let camera, scene, renderer, controls
  let windowWidth, windowHeight

  useEffect(() => {
		async function loadModels() {
      Promise.all([
      	faceapi.nets.ssdMobilenetv1.loadFromUri('/face-api'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/face-api'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/face-api'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/face-api'),
        faceapi.nets.faceExpressionNet.loadFromUri('/face-api')
      ]).then(setModelsLoaded(true))
    }
    loadModels()
	}, [])

  useEffect(() => {
		init()
    return () => {
    	destroy()
    }
  }, [])

  async function init() {
    mounted.current = true
    updateViewport()
  
    const container = containerRef.current

    camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.01, 100)
    camera.position.z = 3
    camera.position.y = 1
    camera.lookAt(0, 0, 0)

    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0x000000)

    const gridHelper = new THREE.GridHelper(10, 10)
    scene.add(gridHelper)

    renderer = new THREE.WebGLRenderer({ antialias: true } )
    renderer.setPixelRatio(window.devicePixelRatio )
    renderer.setSize(windowWidth, windowHeight)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    container.appendChild(renderer.domElement)

    // stats = new Stats()
    // container.appendChild(stats.dom)

    window.addEventListener('resize', onWindowResize)     

    animate()
  }

  function updateViewport() {
    windowWidth = window.innerWidth
    windowHeight = window.innerHeight
  }

  function onWindowResize() {
    updateViewport()
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function animate() {
    if(!mounted.current) return

    controls.update()
    renderer.render(scene, camera)

    requestAnimationFrame(animate)
    // stats.update()
  }

  function startVideo() {
    setCaptureVideo(true)
    navigator.mediaDevices.getUserMedia({
    	video: {
    		width: 300
    	}
    })
    .then(stream => {
      let video = videoRef.current
      video.srcObject = stream
      video.play()
    })
    .catch(err => {
      console.error("error:", err)
    })
  }

  function handleVideoOnPlay() {
    setInterval(async () => {
      if(canvasRef && canvasRef.current) {
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize)

        // SsdMobilenetv1Options
        // MtcnnOptions
        // TinyFaceDetectorOptions
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        console.log(resizedDetections)

        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)

        // canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight)
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
        canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections)
        canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections)
      }
    }, 24)
  }

  function closeWebcam() {
    videoRef.current.pause()
    videoRef.current.srcObject.getTracks()[0].stop()
    setCaptureVideo(false)
  }

  function destroy() {
    mounted.current = false
    window.removeEventListener('resize', onWindowResize)
  }

  return (
  	<div>
  		<div>
			 {captureVideo && modelsLoaded ?
          <button
          	onClick={closeWebcam}
          	className='bg-white text-black rounded-xl px-4 py-3'>
            Close Webcam
          </button>
          :
          <button
          	onClick={startVideo}
          	className='bg-white text-black rounded-xl px-4 py-3'>
            Open Webcam
          </button>
        }
      </div>
      {captureVideo && modelsLoaded &&
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} style={{ borderRadius: '10px' }} />
            <canvas ref={canvasRef} style={{ position: 'absolute' }} />
          </div>
        </div>
      }
	    <div ref={containerRef}></div>
    </div>
  )
}