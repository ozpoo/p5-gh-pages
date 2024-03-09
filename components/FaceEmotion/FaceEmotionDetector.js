import * as tf from '@tensorflow/tfjs'

export default class FaceEmotionDetector {
  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvasCtx = this.canvas.getContext('2d')
    this.detector = null
  }

  init() {
    this.canvas.width = 48
    this.canvas.height = 48
  }

  async loadDetector() {
    this.detector = await tf.loadLayersModel('/emotions/model.json')
  }

  showVideo() {
    document.body.prepend(this.canvas)
  }

  async detectEmotion(source, box) {
    function map(value, in_min, in_max, out_min, out_max) {
      return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
    }

    this.canvas.width = 48
    this.canvas.height = 48

    this.canvasCtx.translate(48, 0)
    this.canvasCtx.scale(-1, 1)

    this.canvasCtx.drawImage(source, map(box.xMax, 0, source.width, source.width, 0), box.yMin, box.width, box.height, 0, 0, 48, 48)

    const tensor = await tf.browser.fromPixels(this.canvas, 1).expandDims(0)
    const offset = tf.scalar(127.5)

    // Normalize the image from [0, 255] to [-1, 1].
    const normalized = tensor.sub(offset).div(offset)
    const prediction =  await this.detector.predict(normalized)

    let arg = tf.argMax(tensor.as1D())
    arg = await arg.array(0)

    let disposition = 'looking...'
    const dispositions = [
      'Angry',
      'Disgusted',
      'Fear',
      'Happy',
      'Sad',
      'Surprise',
      'Neutral',
      'looking...'
    ]
    if(dispositions[arg]) disposition = dispositions[arg]
    return disposition
  }
}