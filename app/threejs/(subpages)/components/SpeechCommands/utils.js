import * as THREE from 'three'

const videoAspectRatio = 1280 / 720
const screenRange = getScreenRanges(videoAspectRatio, 4)

export function flattenFacialLandMarkArray(data) {
  let array = []

  data.forEach((el) => {
    el.x = mapRangetoRange(500 / videoAspectRatio, el.x, screenRange.height) - 1
    el.y = mapRangetoRange(500 / videoAspectRatio, el.y, screenRange.height, true) + 1
    el.z = (el.z / 100) * -1 + 0.5

    array.push(...Object.values(el))
  })

  return array.filter((el) => typeof el === 'number')
}

export function getFaceGeometry(array) {
  const BufferGeometry = new THREE.BufferGeometry()
  const positionArray = new Float32Array(array)
  const positionAttribute = new THREE.BufferAttribute(positionArray, 3)

  return BufferGeometry.setAttribute('position', positionAttribute)
}

export function createBufferAttribute(data) {
  const positionArray = new Float32Array(data)
  return new THREE.BufferAttribute(positionArray, 3)
}

export function updateGeometry(BufferGeometry, attribute, name) {
  BufferGeometry.setAttribute(name, attribute)
  BufferGeometry.attributes[name].needsUpdate = true
}

export function vertexObjectToVertice(data) {
  let array = []
  data.forEach((point) => {
    const v = new THREE.Vector3(point.x, point.y, point.z)
    array = [...array, v]
  })
  return array
}

function getVectorsFromBufferArray(indexes, Attribute, z) {
  const vectorArray = []

  indexes.forEach((index, i) => {
    const vector = new THREE.Vector3(
      Attribute.getX(index),
      Attribute.getY(index),
      Attribute.getZ(index)
    )
    vectorArray.push(vector)
  })

  return vectorArray
}

function flattenVector3Array(vectorArray) {
  let array = []

  vectorArray.forEach((vector) => {
    array = [...array, vector.x, vector.y, vector.z]
  })

  return array
}

export function updatePlaneBuffer(center, positions, updateGeometry) {
  const points = getVectorsFromBufferArray([234, 152, 454, 234, 454, 10], positions, center)
  const positionAttribute = new THREE.BufferAttribute(new Float32Array(flattenVector3Array(points)), 3)
  
  updateGeometry.setAttribute('position', positionAttribute)
  updateGeometry.attributes.position.needsUpdate = true
}

export function getScreenRanges(aspectRatio, width) {
  const screenHeight = width / aspectRatio

  const widthStart = 0 - width / 2
  const widthEnd = widthStart + width

  const heihgtStart = 0 - screenHeight / 2
  const heihgtEnd = heihgtStart + screenHeight

  return {
    height: { from: heihgtStart, to: heihgtEnd },
    width: { from: widthStart, to: widthEnd },
  }
}

export function mapRangetoRange(from, point, range, invert = false) {
  let pointMagnitude = point / from

  if(invert) {
    pointMagnitude = 1 - pointMagnitude
  }

  const targetMagnitude = range.to - range.from
  const pointInRange = targetMagnitude * pointMagnitude + range.from

  return pointInRange
}