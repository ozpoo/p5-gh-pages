'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import WebcamCanvas from '@/components/WebCam/WebcamCanvas'
import FaceMeshDetector from '@/components/FaceMesh/FaceMeshDetector'
import PointCloud from '@/components/FaceMesh/PointCloud'

import { flattenFacialLandMarkArray, createBufferAttribute } from '@/components/FaceMesh/utils'

export const routemetadata = {
  title: 'Face Mesh'
}

export default function FaceMeshSketch() {
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
		const faceMeshDetector = new FaceMeshDetector()
    const pointCloud = new PointCloud()

  	updateViewport()

		await faceMeshDetector.loadDetector()

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
		console.log('resize')
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
  }

  function destroy() {
  	mounted.current = false
    window.removeEventListener('resize', onWindowResize)
  }

  return (
    <div ref={containerRef}></div>
  )
}