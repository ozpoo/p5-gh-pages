'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import useWebAudio from '../components/WebAudio/useWebAudio'
import useTones from '../components/WebAudio/useTones'

export default function WebAudioSketch() {
	const mounted = useRef(null)
  const containerRef = useRef(null)
  const webAudioRef = useRef(useWebAudio())
  const tonesRef = useRef(useTones(webAudioRef.current))

  const [notes, setNotes] = useState(false)
  const [getNotes, setGetNotes] = useState(false)

  useEffect(() => {
  	mounted.current = true

  	setNotes([...Array(9)].map((a, i) => {
  		return Object.entries(webAudioRef.current.getNotes()).map(([key, value]) => {
				return {
					octive: i,
					note: key,
					frequency: value[i]
				}
			}).flat(1)
  	}).flat(1))

  	let camera, scene, renderer, controls
  	let windowWidth, windowHeight

  	updateViewport()
		init()

		async function init() {
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
  	<div>
  		<div className='flex gap-2'>
	  		{notes && notes.map(note =>
	  			<div key={note.note + '-' + note.octive}>
		  			<button
		  				className='whitespace-nowrap'
			  			onClick={() => {
		  					tonesRef.current.playTone(note.frequency)
					  	}}>
				  	{note.note} {note.octive} {tonesRef.current.isPlaying(note.frequency) && 'Playing'}
			  	</button>
			  	<button onClick={() => {
			  		tonesRef.current.stopTone(note.frequency)
			  	}}>Stop</button>
		  	</div>
				)}
			</div>
	    <div ref={containerRef}></div>
    </div>
  )
}