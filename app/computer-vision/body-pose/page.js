'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import WebcamCanvas from '@/components/WebCam/WebcamCanvas'
import BodyPoseDetector from '@/components/BodyPose/BodyPoseDetector'
import PointCloud from '@/components/BodyPose/PointCloud'

import { flattenBodyPoseArray, createBufferAttribute, createSkeletonBufferAttribute, getIndexes } from '@/components/BodyPose/utils'

export default function BodyPoseSketch() {
	const mounted = useRef(null)
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
		const bodyPoseDetector = new BodyPoseDetector()
    const pointCloud = new PointCloud()

  	updateViewport()
  	
		await bodyPoseDetector.loadDetector()

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
		scene.add(pointCloud.skeleton)

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
			bindBodyDataToPointCloud()
			webCamCanvas.updateFromWebCam()
		}

		controls.update()
		renderer.render(scene, camera)

		requestAnimationFrame(animate)
		// stats.update()
	}

	async function bindBodyDataToPointCloud() {
    const keypoints = await bodyPoseDetector.detectBody(webCamCanvas.canvas)
    const flatData = flattenBodyPoseArray(keypoints)
    
    const bodyPositions = createBufferAttribute(flatData)
    pointCloud.updateProperty(bodyPositions, 'position')

    const skeletonGeometry = createSkeletonBufferAttribute(flatData)
    const skeletonIndexes = getIndexes()

    pointCloud.updateSkeletonProperty(skeletonGeometry, skeletonIndexes, 'position')
  }

  function destroy() {
  	mounted.current = false
    window.removeEventListener('resize', onWindowResize)
  }

  return (
    <div ref={containerRef}></div>
  )
}