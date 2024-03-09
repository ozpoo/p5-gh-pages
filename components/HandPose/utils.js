import * as THREE from 'three'

const videoAspectRatio = 1280 / 720
const screenRange = getScreenRanges(videoAspectRatio, 4)

const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20]
}

const connections = {
  thumb: [[0, 1], [1, 2], [2, 3], [3, 4]],
  indexFinger: [[0, 5], [5, 6], [6, 7], [7, 8], [8, 9]],
  middleFinger: [[0, 10], [10, 11], [11, 12], [12, 13], [13, 14]],
  ringFinger: [[0, 15], [15, 16], [16, 17], [17, 18], [18, 19]],
  pinky: [[0, 20], [20, 21],[21, 22], [22, 23], [23, 24]]
}

export function flattenHandPoseArray(data) {
  let array = []
  const scale = 16

  data.forEach(el => {
    // const x = mapRangetoRange(500, el.x, screenRange.width)
    // const y = mapRangetoRange(500 / videoAspectRatio, el.y, screenRange.height, true)

    const x = el.x * scale
    const y = -el.y * scale
    const z = el.z * scale

    array.push(...[x, y, z])
  })

  return array.filter(el => typeof el === 'number')
}

export function getHandGeometry(array) {
  const BufferGeometry = new THREE.BufferGeometry()
  const positionArray = new Float32Array(array)
  const positionAttribute = new THREE.BufferAttribute(positionArray, 3)

  return BufferGeometry.setAttribute('position', positionAttribute)
}

export function createCloudBufferAttribute(data) {
  const positionArray = new Float32Array(data)
  return new THREE.BufferAttribute(positionArray, 3)
}

export function createSkeletonBufferAttribute(data) {
  const skeleton = []

  const positionArray = new Float32Array(data)
  const fingers = Object.keys(fingerLookupIndices)

  fingers.forEach(finger =>  {
    fingerLookupIndices[finger].forEach(idx => {
      skeleton.push(positionArray[idx * 3])
      skeleton.push(positionArray[idx * 3 + 1])
      skeleton.push(positionArray[idx * 3 + 2])
    })
  })

  return new THREE.Float32BufferAttribute(skeleton, 3)
}

export function getIndexes(_fingers = false) {
  const indexes = []

  const fingers = _fingers || Object.keys(fingerLookupIndices)
  fingers.forEach(finger =>  {
    indexes.push(...connections[finger].flat(1))
  })

  return indexes
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
  const positionAttribute = new THREE.BufferAttribute(
    new Float32Array(flattenVector3Array(points)),
    3
  )
  updateGeometry.setAttribute('position', positionAttribute)
  updateGeometry.attributes.position.needsUpdate = true
}

export function getScreenRanges(aspectRatio, width) {
  const screenHeight = width / aspectRatio

  const widthStart = 0 - width / 2
  const widthEnd = widthStart + width

  const heightStart = 0 - screenHeight / 2
  const heightEnd = heightStart + screenHeight

  return {
    height: { from: heightStart, to: heightEnd },
    width: { from: widthStart, to: widthEnd }
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