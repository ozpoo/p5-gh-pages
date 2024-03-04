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
  }

  updateProperty(attribute, name) {
    this.bufferGeometry.setAttribute(name, attribute)
    this.bufferGeometry.attributes[name].needsUpdate = true
  }
}