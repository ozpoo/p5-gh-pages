'use client'

import { useEffect, useRef, useState } from 'react'

import useWebAudio from '@/components/WebAudio/useWebAudio'
import useTones from '@/components/WebAudio/useTones'

export const routemetadata = {
  title: 'Web Audio'
}

export default function WebAudioSketch() {
	const mounted = useRef(null)

  const webAudioRef = useRef(useWebAudio())
  const tonesRef = useRef(useTones(webAudioRef.current))

  const [notes, setNotes] = useState(false)
  const [getNotes, setGetNotes] = useState(false)

  useEffect(() => {
		init()
    return () => {
    	destroy()
    }
  }, [])

  async function init() {
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
	}

	function destroy() {
		mounted.current = false
	}

  return (
  	<div>
  		<div className='flex gap-2'>
  			<ul>
		  		{notes && notes.map(note =>
		  			<li key={note.note + '-' + note.octive} className='flex gap-6 items-center'>
			  			<button
			  				className='text-left whitespace-nowrap w-16'
				  			onClick={() => {
			  					tonesRef.current.playTone(note.frequency)
						  	}}>
					  	{note.note} {note.octive} {tonesRef.current.isPlaying(note.frequency) && 'Playing'}
				  	</button>
				  	<button
					  	onClick={() => {
					  		tonesRef.current.stopTone(note.frequency)
					  	}}>
					  	Stop
				  	</button>
			  	</li>
					)}
				</ul>
			</div>
    </div>
  )
}