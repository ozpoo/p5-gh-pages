import * as THREE from 'three'

export default class PointCloud {
  constructor() {
    this.bufferGeometry = new THREE.BufferGeometry()
    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.0151,
      sizeAttenuation: true
    })
    this.cloud = new THREE.Points(this.bufferGeometry, this.material)

    this.skeletonBufferGeometry = new THREE.BufferGeometry()
    this.skeletonMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    })
    this.skeleton = new THREE.LineSegments(this.skeletonBufferGeometry, this.skeletonMaterial)
  }

  updateProperty(attribute, name) {
    this.bufferGeometry.setAttribute(name, attribute)
    this.bufferGeometry.attributes[name].needsUpdate = true
  }

  updateSkeletonProperty(attribute, indexes, name) {
    this.skeletonBufferGeometry.setAttribute(name, attribute)
    this.skeletonBufferGeometry.setIndex(indexes)
    this.skeletonBufferGeometry.attributes[name].needsUpdate = true
  }
}