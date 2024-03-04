'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import SpeechCommandsDetector from '../components/SpeechCommands/SpeechCommandsDetector'

export default function FaceMeshSketch() {
	const mounted = useRef(null)
  const containerRef = useRef(null)
  const [action, setAction] = useState(false)

  const speechCommandsDetector = new SpeechCommandsDetector()

  useEffect(() => {
  	mounted.current = true

  	let camera, scene, renderer, controls
  	let windowWidth, windowHeight

  	updateViewport()

		init()

		async function init() {
			await speechCommandsDetector.loadDetector()

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

    return () => {
    	mounted.current = false
      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  return (
  	<>
	  	<button onClick={() => {
	  		speechCommandsDetector.listen(a => {
	  			setAction(a)
	  		})
	  	}}>
		  	Listen
	  	</button>
	  	<button onClick={() => {
	  		speechCommandsDetector.stopListening()
	  	}}>
		  	Stop
	  	</button>
	  	<p>{action}</p>
	    <div ref={containerRef}></div>
    </>
  )
}