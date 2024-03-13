import { useRef } from 'react'

import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu'

import * as speech from '@tensorflow-models/speech-commands'

export default function useImageSegmentor() {
  const speechCommands = useRef(null)
  const live = useRef(null)

  async function init(props) {
  	return new Promise(async resolve => {
      await tf.ready() 

      speechCommands.current = speech.create('BROWSER_FFT')
      await speechCommands.current.ensureModelLoaded()

      resolve(true)
	  })
  }

  function listen(callback) {
    speechCommands.current.listen(result => {
      console.log('listening')

      // - result.scores contains the probability scores that correspond to
      // - result.spectrogram contains the spectrogram of the recognized word.

      let action = false
      let score = 0

      const words = speechCommands.current.wordLabels()
      for(let i = 0; i < words.length; ++i) {
        if(result.scores[i] > score) {
          score = result.scores[i]
          action = words[i]
        }
        // console.log(`score for word '${words[i]}' = ${result.scores[i]}`)
      }

      if(score < 0.98) {
        console.log('no command')
        return
      }

      if(action === 'start') {
        live.current = true
        console.log('live')
      }

      if(action === 'stop') {
        live.current = false
        console.log('not live')
      }

      callback(action)
    }, {
      includeSpectrogram: true,
      probabilityThreshold: 0.75
    })
  }

  function stop() {
    live.curent = false
    speechCommands.current.stopListening()
    console.log('not listening')
  }

  function destroy() {
    if(live.curent) {
      speechCommands.current.stopListening()
    }
    speechCommands.current = null
    live.current = null
  }

  return {
    init,
    destroy,
    listen,
    stop
  }
}