'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const routemetadata = {
  title: 'Example'
}

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