import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-converter'
import '@tensorflow/tfjs-backend-webgl'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'

export default class HandPoseDetector {
  constructor() {
    this.model = handPoseDetection.SupportedModels.MediaPipeHands
    this.detectorConfig = {
      runtime: 'mediapipe',
      modelType: 'full',
      refineLandmarks: true,
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
    }
    this.detector = null
  }

  getDetector() {
    return handPoseDetection.createDetector(
      this.model,
      this.detectorConfig
    )
  }

  async loadDetector() {
    await tf.ready()
    this.detector = await this.getDetector()
  }

  async detectHands(source) {
    if(!this.detector) {
      throw new Error('call the loadDetector method first on this class before calling this')
    }

    const data = await this.detector.estimateHands(source, { flipHorizontal: true })
    const keypoints = data

    if(keypoints) {
      return keypoints
    }

    return []
  }
}