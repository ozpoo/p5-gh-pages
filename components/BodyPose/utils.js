import * as THREE from 'three'

const videoAspectRatio = 1280 / 720
const screenRange = getScreenRanges(videoAspectRatio, 4)

export function flattenBodyPoseArray(data) {
  let array = []
  const scale = 3

  data.forEach(el => {
    const x = -el.x * scale
    const y = -el.y * scale
    const z = el.z * scale

    array.push(...[x, y, z])
  })

  return array.filter(el => typeof el === 'number')
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

export function createSkeletonBufferAttribute(data) {
  const skeleton = []

  const positionArray = new Float32Array(data)
  const body = Object.keys(bodyLookupIndices)

  body.forEach(appendage =>  {
    bodyLookupIndices[appendage].forEach(idx => {
      skeleton.push(positionArray[idx * 3])
      skeleton.push(positionArray[idx * 3 + 1])
      skeleton.push(positionArray[idx * 3 + 2])
    })
  })

  return new THREE.Float32BufferAttribute(skeleton, 3)
}

export function getIndexes(_appendages = false) {
  const indexes = []
  const body = _appendages || Object.keys(bodyLookupIndices)
  body.forEach(appendage =>  {
    indexes.push(...connections[appendage].flat(1))
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

const bodyLookupIndices = {
  left_arm: [11, 13, 15, 21],
  right_arm: [12, 14, 16, 22],
  torso: [11, 23, 12, 24],
  left_leg: [23, 25, 27, 29],
  right_leg: [24, 26, 28, 30]
}

const connections = {
  left_arm: [[0, 1], [1, 2], [2, 3]],
  right_arm: [[4, 5], [5, 6], [6, 7]],
  torso: [[8, 9], [10, 11]],
  left_leg: [[12, 13], [13, 14], [14, 15]],
  right_leg: [[16, 17], [17, 18], [18, 19]]
}

// {x: -2.125195137768984, y: 2.1285353195667267, z: 0.5048535224795342, score: 0.9969409704208374, name: 'nose'} 0
// {x: -2.12512186422199, y: 2.1288462426662447, z: 0.5049360963702202, score: 0.9972089529037476, name: 'left_eye_inner'} 1
// {x: -2.12511695343256, y: 2.128848204851151, z: 0.5049312737584114, score: 0.9973559975624084, name: 'left_eye'} 2
// {x: -2.125120090998709, y: 2.128850179195404, z: 0.5049308288097382, score: 0.9976707100868225, name: 'left_eye_outer'} 3
// {x: -2.125360019773245, y: 2.1288266134262086, z: 0.504901148378849, score: 0.9962520599365234, name: 'right_eye_inner'} 4
// {x: -2.1253597928285597, y: 2.1288303492069245, z: 0.5049226689338684, score: 0.9953675866127014, name: 'right_eye'} 5
// {x: -2.1253644785284997, y: 2.128839022636414, z: 0.5049154335260391, score: 0.9948389530181885, name: 'right_eye_outer'} 6
// {x: -2.1247082735300067, y: 2.1289877464771267, z: 0.5040421053767205, score: 0.9979451298713684, name: 'left_ear'} 7
// {x: -2.1257810742855074, y: 2.1288949842453007, z: 0.5039440274238587, score: 0.9942418336868286, name: 'right_ear'} 8
// {x: -2.124996817771345, y: 2.1284526214599606, z: 0.5044739481806755, score: 0.9940743446350098, name: 'mouth_left'} 9
// {x: -2.1253141682446004, y: 2.1284173958301547, z: 0.5044380092620849, score: 0.9883606433868408, name: 'mouth_right'} 10
// {x: -2.123874777317047, y: 2.1281222348213196, z: 0.5028441143035889, score: 0.9944164156913757, name: 'left_shoulder'} 11
// {x: -2.1262745826244354, y: 2.1278970313072203, z: 0.5027229949831963, score: 0.975042998790741, name: 'right_shoulder'} 12
// {x: -2.1228292052745816, y: 2.1274139025211336, z: 0.5032338923215867, score: 0.6748473048210144, name: 'left_elbow'} 13
// {x: -2.126591892361641, y: 2.1271078283786777, z: 0.5018500006198883, score: 0.22433850169181824, name: 'right_elbow'} 14
// {x: -2.1224165625572207, y: 2.12706276845932, z: 0.504570237994194, score: 0.5019338130950928, name: 'left_wrist'} 15
// {x: -2.1263819978237155, y: 2.127580740451813, z: 0.5013348704576492, score: 0.30715566873550415, name: 'right_wrist'} 16
// {x: -2.1223704261779783, y: 2.127054432153702, z: 0.504820681810379, score: 0.43260714411735535, name: 'left_pinky'} 17
// {x: -2.126200506687164, y: 2.1277136418819427, z: 0.5012961658835411, score: 0.2598952054977417, name: 'right_pinky'}  18
// {x: -2.1223812258243564, y: 2.127073080778122, z: 0.5048565503954887, score: 0.5028664469718933, name: 'left_index'} 19
// {x: -2.1263917524814606, y: 2.127877209186554, z: 0.5012530428171158, score: 0.3024396300315857, name: 'right_index'} 20
// {x: -2.1224472444057465, y: 2.127022877454758, z: 0.504582763016224, score: 0.4566045105457306, name: 'left_thumb'} 21
// {x: -2.1263731194734574, y: 2.1276599140167236, z: 0.5012874254584312, score: 0.2769129276275635, name: 'right_thumb'} 22
// {x: -2.1240466750860216, y: 2.1250075838784688, z: 0.4999024805333465, score: 0.008595944382250309, name: 'left_hip'} 23
// {x: -2.1259535689353943, y: 2.125157993286848, z: 0.5000625455426052, score: 0.007557034958153963, name: 'right_hip'} 24
// {x: -2.12375814640522, y: 2.125037847466767, z: 0.5000351392896846, score: 0.01484603714197874, name: 'left_knee'} 25
// {x: -2.1253978005051612, y: 2.1265368525981905, z: 0.5002228373102844, score: 0.015426665544509888, name: 'right_knee'} 25
// {x: -2.1233177441358566, y: 2.1234338063001634, z: 0.49700764179229734, score: 0.0007263390580192208, name: 'left_ankle'} 27
// {x: -2.1250475192815066, y: 2.1247661314457655, z: 0.49836140766739845, score: 0.0007775715203024447, name: 'right_ankle'} 28
// {x: -2.123398731946945, y: 2.1229560461044312, z: 0.49643370002508164, score: 0.0003639591741375625, name: 'left_heel'} 29
// {x: -2.1250837735384702, y: 2.1242989721894263, z: 0.4976372280716896, score: 0.0008373421733267605, name: 'right_heel'} 30
// {x: -2.1227110753059386, y: 2.125209843248129, z: 0.4989355389773846, score: 0.0008187504136003554, name: 'left_foot_index'}
// {x: -2.125013809883967, y: 2.125880246579647, z: 0.5001737567596137, score: 0.001939964247867465, name: 'right_foot_index'}