'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as Tone from 'tone'

export default function ToneJSSKetch() {
	const mounted = useRef(null)
  const containerRef = useRef(null)
  
  const [isLoaded, setLoaded] = useState(false)
  const osc = useRef(null)
  const synth = useRef(null)

  useEffect(() => {
    // osc.current = new Tone.Oscillator(440, "sine").toDestination()
    // osc.current.type = "sine2"

    // osc.current = new Tone.AMOscillator(64, "sine", "square").toDestination()

    // osc.current = new Tone.FMOscillator({
		// 	frequency: 64,
		// 	type: "square",
		// 	modulationType: "triangle",
		// 	harmonicity: 0.2,
		// 	modulationIndex: 3
		// }).toDestination()

		// osc.current = new Tone.FatOscillator("Ab3", "sawtooth", 40).toDestination()

  	// initialize the noise and start
		// const noise = new Tone.Noise("pink").start()
		// // make an autofilter to shape the noise
		// osc.current = new Tone.AutoFilter({
		// 	frequency: "8n",
		// 	baseFrequency: 200,
		// 	octaves: 8
		// }).toDestination()
		// // connect the noise
		// noise.connect(osc.current)

		// osc.current = new Tone.OmniOscillator("C#4", "pwm").toDestination()
		// osc.current = new Tone.PWMOscillator(60, 0.3).toDestination()
		// osc.current = new Tone.PulseOscillator(50, 0.4).toDestination()

		// const meter = new Tone.Meter();
		// const mic = new Tone.UserMedia().connect(meter);
		// mic.open().then(() => {
		// 	// promise resolves when input is available
		// 	console.log("mic open");
		// 	// print the incoming mic levels in decibels
		// 	setInterval(() => console.log(meter.getValue()), 100);
		// }).catch(e => {
		// 	// promise is rejected when the user doesn't have or allow mic access
		// 	console.log("mic not open");
		// });

		// synth.current = new Tone.AMSynth().toDestination()
		// synth.current = new Tone.DuoSynth().toDestination()
		// synth.current = new Tone.FMSynth().toDestination()
		// synth.current = new Tone.MembraneSynth().toDestination()
		// synth.current = new Tone.MetalSynth().toDestination()
		// synth.current = new Tone.MonoSynth({
		// 	oscillator: {
		// 		type: "square"
		// 	},
		// 	envelope: {
		// 		attack: 0.1
		// 	}
		// }).toDestination()
		// synth.current = new Tone.NoiseSynth().toDestination()
		// synth.current = new Tone.PluckSynth().toDestination()
		// synth.current = new Tone.PolySynth().toDestination()
		// synth.current.set({ detune: -1200 })
		// synth.current = new Tone.Synth().toDestination()

		// const autoWah = new Tone.AutoWah(50, 6, -30).toDestination()
		// autoWah.Q.value = 6
		// synth.current = new Tone.Synth().connect(autoWah)

		// const crusher = new Tone.BitCrusher(4).toDestination()
		// synth.current = new Tone.Synth().connect(crusher)

		// const cheby = new Tone.Chebyshev(50).toDestination()
		// synth.current = new Tone.MonoSynth().connect(cheby)

		// const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start()
		// synth.current = new Tone.PolySynth().connect(chorus)

		// const dist = new Tone.Distortion(0.8).toDestination()
		// synth.current = new Tone.FMSynth().connect(dist)

		// const feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).toDestination()
		// synth.current = new Tone.MembraneSynth({
		// 	octaves: 4,
		// 	pitchDecay: 0.1
		// }).connect(feedbackDelay)

		// const phaser = new Tone.Phaser({
		// 	frequency: 15,
		// 	octaves: 5,
		// 	baseFrequency: 1000
		// }).toDestination()
		// synth.current = new Tone.FMSynth().connect(phaser)

		// const autoFilter = new Tone.AutoFilter("4n").toDestination().start()
		// osc.current = new Tone.Oscillator().connect(autoFilter)

		// osc.current = new Tone.Oscillator(230, "sawtooth")
		// const shift = new Tone.FrequencyShifter(42).toDestination()
		// osc.current.connect(shift)

		// const autoPanner = new Tone.AutoPanner("4n").toDestination().start()
		// osc.current = new Tone.Oscillator().connect(autoPanner)

		// const pingPong = new Tone.PingPongDelay("4n", 0.2).toDestination()
		// synth.current = new Tone.MembraneSynth().connect(pingPong)

		// const tremolo = new Tone.Reverb(9).toDestination()
		// osc.current = new Tone.Oscillator().connect(tremolo)

		// const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start()
		// osc.current = new Tone.Oscillator().connect(tremolo)

		// const tremolo = new Tone.Vibrato(9, 0.75).toDestination()
		// osc.current = new Tone.Oscillator().connect(tremolo)
	}, [])

  useEffect(() => {
  	mounted.current = true

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
			<button
				className='whitespace-nowrap'
  			onClick={() => {
					osc.current.start()

					// synth.current.triggerAttackRelease("C4", "4n")

					// synth.current.triggerAttackRelease("8n", 0.5) // noise synth

					// synth.current.triggerAttack("C4", "+0.5") // pluck synth
					// synth.current.triggerAttack("C3", "+1")
					// synth.current.triggerAttack("C2", "+1.5")
					// synth.current.triggerAttack("C1", "+2")

					// synth.current.triggerAttackRelease(["C4", "E4", "A4"], 1) // poly synth

					// synth.current.triggerAttackRelease("C2", 2) // bit crusher
					// synth.current.triggerAttackRelease("C2", 0.4) // cheby
					// synth.current.triggerAttackRelease(["C3", "E3", "G3"], "8n") // chorus
		  	}}>
		  	Start
	  	</button>
	  	<button
				className='whitespace-nowrap'
  			onClick={() => {
					osc.current.stop()
		  	}}>
		  	Stop
	  	</button>
	    <div ref={containerRef}></div>
    </div>
  )
}