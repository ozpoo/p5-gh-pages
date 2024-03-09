'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import WebcamCanvas from '@/components/WebCam/WebcamCanvas'
import FaceMeshDetector from '@/components/FaceMesh/FaceMeshDetector'
import FaceEmotionDetector from '@/components/FaceEmotion/FaceEmotionDetector'
import PointCloud from '@/components/FaceMesh/PointCloud'

import * as tf from '@tensorflow/tfjs'

import { flattenFacialLandMarkArray, createBufferAttribute } from '@/components/FaceMesh/utils'

export default function FaceMeshSketch() {
	const mounted = useRef(null)
	const model = useRef(null)
	const canRef = useRef(null)
	const camRef = useRef(null)
  const containerRef = useRef(null)

  let camera, scene, renderer, controls
	let windowWidth, windowHeight

  useEffect(() => {
		init()
    return () => {
    	destroy()
    }
  }, [])

  async function init() {
		mounted.current = true
	
		const webCamCanvas = new WebcamCanvas()
		const faceMeshDetector = new FaceMeshDetector()
		const faceEmotionDetector = new FaceEmotionDetector()
    const pointCloud = new PointCloud()

    // async function classify(box) {
    // 	const canvas = canRef.current
	  //   const context = canvas.getContext('2d')

	  //   canvas.width = 48
	  //   canvas.height = 48

	  //   context.translate(48, 0)
		// 	context.scale(-1, 1)

		// 	function map(value, in_min, in_max, out_min, out_max) {
		// 	  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
		// 	}

	  //   context.drawImage(webCamCanvas.canvas, map(box.xMax, 0, webCamCanvas.canvas.width, webCamCanvas.canvas.width, 0), box.yMin, box.width, box.height, 0, 0, 48, 48)

		//   const tensor = await tf.browser.fromPixels(canRef.current, 1).expandDims(0)
		//   const offset = tf.scalar(127.5)

		//   // Normalize the image from [0, 255] to [-1, 1].
		//   const normalized = tensor.sub(offset).div(offset)
		//   const prediction =  await model.current.predict(normalized)

		//   let arg = tf.argMax(tensor.as1D())
		//   arg = await arg.array(0)

		//   let disposition = 'looking...'
		//   const dispositions = [
		//   	'Angry',
		//   	'Disgusted',
		//   	'Fear',
		//   	'Happy',
		//   	'Sad',
		//   	'Surprise',
		//   	'Neutral',
		//   	'looking...'
	  // 	]
		//   if(dispositions[arg]) disposition = dispositions[arg]
		//   return disposition
		// }

  	updateViewport()
  	
		await faceMeshDetector.loadDetector()
		await faceEmotionDetector.loadDetector()

		// model.current = await tf.loadLayersModel('/emotions/model.json')

		const container = containerRef.current

		camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.01, 100)
		camera.position.z = 3
    camera.position.y = 1
    camera.lookAt(0, 0, 0)

		scene = new THREE.Scene()
		// scene.background = new THREE.Color(0x000000)

		const gridHelper = new THREE.GridHelper(10, 10)
    scene.add(gridHelper)
    
		scene.add(pointCloud.cloud)

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

		if(webCamCanvas.receivingStream) {
			bindFaceDataToPointCloud()
			webCamCanvas.updateFromWebCam()
		}

		controls.update()
		renderer.render(scene, camera)

		requestAnimationFrame(animate)
		// stats.update()
	}

	async function bindFaceDataToPointCloud() {
    const data = await faceMeshDetector.detectFace(webCamCanvas.canvas)
    const { keypoints, box } = data[0] || {}
    const flatData = flattenFacialLandMarkArray(keypoints || [])
    const facePositions = createBufferAttribute(flatData)

    pointCloud.updateProperty(facePositions, 'position')

    const prediction = await faceEmotionDetector.detectEmotion(webCamCanvas.canvas, box || {})
    console.log(prediction)
  }

  function destroy() {
		mounted.current = false
    window.removeEventListener('resize', onWindowResize)
  }

  return (
  	<>
	  	<canvas ref={canRef} height='48' width='48' className='relative z-100' />
	    <div ref={containerRef}></div>
    </>
  )
}