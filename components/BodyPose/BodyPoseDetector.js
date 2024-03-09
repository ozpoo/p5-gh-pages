import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu'

import * as bodyPoseDetection from '@tensorflow-models/pose-detection'

export default class BodyPoseDetector {
  constructor() {
    this.model = bodyPoseDetection.SupportedModels.BlazePose
    this.detectorConfig = {
      runtime: 'tfjs'
    }
    this.detector = null
  }

  getDetector() {
    return bodyPoseDetection.createDetector(
      this.model,
      this.detectorConfig
    )
  }

  async loadDetector() {
    await tf.ready()
    this.detector = await this.getDetector()
  }

  async detectBody(source) {
    if(!this.detector) {
      throw new Error('call the loadDetector method first on this class before calling this')
    }

    const data = await this.detector.estimatePoses(source, { flipHorizontal: true })
    const keypoints = data[0]?.keypoints3D

    if(keypoints) {
      return keypoints
    }

    return []
  }
}