'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import WebcamCanvas from '@/components/WebCam/WebcamCanvas'
import HandPoseDetector from '@/components/HandPose/HandPoseDetector'
import PointCloud from '@/components/HandPose/PointCloud'

import { flattenHandPoseArray, getIndexes, createCloudBufferAttribute, createSkeletonBufferAttribute } from '@/components/HandPose/utils'

export const routemetadata = {
  title: 'Hand Pose'
}

export default function HandPoseSketch() {
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
		const handPoseDetector = new HandPoseDetector()
    const pointCloud = new PointCloud()

  	updateViewport()

		await handPoseDetector.loadDetector()

		const container = containerRef.current

		camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.02, 100)
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
			bindFaceDataToPointCloud()
			webCamCanvas.updateFromWebCam()
		}

		controls.update()
		renderer.render(scene, camera)

		requestAnimationFrame(animate)
		// stats.update()
	}

	async function bindFaceDataToPointCloud() {
    const data = await handPoseDetector.detectHands(webCamCanvas.canvas)
    const { keypoints3D, box } = data[0] || {}
    
    const flatData = flattenHandPoseArray(keypoints3D || [])

    const cloudGeometry = createCloudBufferAttribute(flatData)
    pointCloud.updateCloudProperty(cloudGeometry, 'position')

    const skeletonGeometry = createSkeletonBufferAttribute(flatData)
    // const skeletonIndexes = getIndexes(['thumb'])
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