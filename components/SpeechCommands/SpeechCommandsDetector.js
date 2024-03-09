import * as tf from '@tensorflow/tfjs'
import * as speechCommands from '@tensorflow-models/speech-commands'

export default class SpeechCommandsDetector {
  constructor() {
    this.detector = null
    this.live = false
  }

  async loadDetector() {
    this.detector = speechCommands.create('BROWSER_FFT', '18w')
    await this.detector.ensureModelLoaded()

    // const transferRecognizer = this.detector.createTransfer('colors')
    // await transferRecognizer.collectExample('red')
    // await transferRecognizer.collectExample('green')
    // await transferRecognizer.collectExample('blue')
    // await transferRecognizer.collectExample('red')
    // // Don't forget to collect some background-noise examples, so that the
    // // transfer-learned model will be able to detect moments of silence.
    // await transferRecognizer.collectExample('_background_noise_')
    // await transferRecognizer.collectExample('green')
    // await transferRecognizer.collectExample('blue')
    // await transferRecognizer.collectExample('_background_noise_')

    // console.log(transferRecognizer.countExamples())

    // await transferRecognizer.train({
    //   epochs: 25,
    //   callback: {
    //     onEpochEnd: async (epoch, logs) => {
    //       console.log(`Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.acc}`);
    //     }
    //   }
    // })

    // const serialized = transferRecognizer.serializeExamples()
    // transferRecognizer.loadExamples(serialized)

    // console.log(serialized)
    console.log(this.detector.wordLabels())
  }

  listen(callback) {
    this.detector.listen(result => {
      console.log('listening')

      // - result.scores contains the probability scores that correspond to
      // - result.spectrogram contains the spectrogram of the recognized word.

      let action = false
      let score = 0

      const words = this.detector.wordLabels()
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
        this.live = true
        console.log('live')
      }

      if(action === 'stop') {
        this.live = false
        console.log('not live')
      }

      callback(action)
    }, {
      includeSpectrogram: true,
      probabilityThreshold: 0.75
    })
  }

  stopListening() {
    this.live = false
    this.detector.stopListening()
    console.log('not listening')
  }
}