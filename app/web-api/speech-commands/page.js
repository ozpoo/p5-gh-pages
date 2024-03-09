'use client'

import { useEffect, useRef, useState } from 'react'

import SpeechCommandsDetector from '@/components/SpeechCommands/SpeechCommandsDetector'

export default function FaceMeshSketch() {
	const mounted = useRef(null)
  const [action, setAction] = useState(false)

  const speechCommandsDetector = new SpeechCommandsDetector()

  useEffect(() => {
		init()
    return () => {
    	destroy()
    }
  }, [])

  async function init() {
  	mounted.current = true
		await speechCommandsDetector.loadDetector()
	}

	function destroy() {
		mounted.current = false
	}

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
    </>
  )
}