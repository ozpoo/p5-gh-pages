'use client'

import { useEffect, useRef, useState } from 'react'
import { useSpeechCommands } from '@/hooks'

export const routemetadata = {
  title: 'Speech Commands'
}

export default function SpeechCommands() {
	const mounted = useRef(null)
  const [action, setAction] = useState(false)

  const speechCommandsDetector = useSpeechCommands()

  useEffect(() => {
		init()
    return () => {
    	destroy()
    }
  }, [])

  async function init() {
  	mounted.current = true
		await speechCommandsDetector.init()
	}

	function destroy() {
		mounted.current = false
		speechCommandsDetector.destroy()
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
	  		speechCommandsDetector.stop()
	  	}}>
		  	Stop
	  	</button>
	  	<p>{action}</p>
    </>
  )
}