import * as THREE from 'three'

export default class PointCloud {
  constructor() {
    this.cloudBufferGeometry = new THREE.BufferGeometry()
    this.cloudMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.0151
    })
    this.cloud = new THREE.Points(this.cloudBufferGeometry, this.cloudMaterial)

    this.skeletonBufferGeometry = new THREE.BufferGeometry()
    this.skeletonMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    })
    this.skeleton = new THREE.LineSegments(this.skeletonBufferGeometry, this.skeletonMaterial)
  }

  updateCloudProperty(attribute, name) {
    this.cloudBufferGeometry.setAttribute(name, attribute)
    this.cloudBufferGeometry.attributes[name].needsUpdate = true
  }

  updateSkeletonProperty(attribute, indexes, name) {
    this.skeletonBufferGeometry.setAttribute(name, attribute)
    this.skeletonBufferGeometry.setIndex(indexes)
    this.skeletonBufferGeometry.attributes[name].needsUpdate = true
  }
}