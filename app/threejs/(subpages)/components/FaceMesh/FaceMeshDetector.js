import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu'

import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'

export default class FaceMeshDetector {
  constructor() {
    this.model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
    this.detectorConfig = {
      runtime: 'mediapipe',
      refineLandmarks: true,
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh'
    }
    this.detector = null
  }

  async getDetector() {
    return await faceLandmarksDetection.createDetector(
      this.model,
      this.detectorConfig
    )
  }

  async loadDetector() {
    await tf.ready()
    this.detector = await this.getDetector()
  }

  async detectFace(source) {
    if(!this.detector) {
      throw new Error('call the loadDetector method first on this class before calling this')
    }

    const data = await this.detector.estimateFaces(source, { flipHorizontal: true })
    const keypoints = data

    if(keypoints) {
      return keypoints
    }

    return []
  }
}