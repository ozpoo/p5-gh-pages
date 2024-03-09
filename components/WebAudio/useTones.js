import { useState, useRef } from 'react'

export default function useTones(_webAudio) {
  const webAudio = useRef(_webAudio)
  const oscillators = useRef({})

  const attackDuration = 0.001
  const releaseDuration = 0.001
  const decayDuration = 0.1
  const sustainLevel = 1

  const [update, setUpdate] = useState(false)

  function playTone(_frequency, _volume) {
    const audioContext = webAudio.current.getContext()
    const time = audioContext.currentTime
    const volume = _volume || 1

    const vco = getVco(audioContext, _frequency) // oscillator

    const biquadFilter = getBiquadFilter(audioContext) // lowpass
    vco.connect(biquadFilter)

    const reverb = getReverb(audioContext) // convolver
    biquadFilter.connect(reverb)

    const distortion = getDistortion(audioContext) // wave shaper
    reverb.connect(distortion)

    const vca = audioContext.createGain() // volume control

    vca.gain.setValueAtTime(0, time)
    vca.gain.linearRampToValueAtTime(sustainLevel + volume, time + attackDuration)
    vca.gain.setTargetAtTime(volume, time + attackDuration, decayDuration)

    distortion.connect(vca)

    vca.connect(audioContext.destination)

    oscillators.current[_frequency] = {
      vco,
      vca,
      volume: volume
    }

    setUpdate(Date.now())
  }

  function stopTone(_frequency) {
    const tone = oscillators.current[_frequency]

    if(!tone) return false

    const audioContext = webAudio.current.getContext()
    const time = audioContext.currentTime

    tone.vca.gain.cancelScheduledValues(time)
    tone.vca.gain.setValueAtTime(tone.vca.gain.value, time)
    tone.vca.gain.linearRampToValueAtTime(0, time + releaseDuration)
    // tone.vco.stop(time + releaseDuration)

    tone.volume = 0

    // tone.vco.stop(time + releaseDuration)
    // delete oscillators.current[_frequency]

    setUpdate(time)
  }

  function isPlaying(_frequency) {
    const tone = oscillators.current[_frequency]
    return tone && tone.volume > 0
  }

  function getNotes() {
    return {
      'C': [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01],
      'Db': [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
      'D': [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
      'Eb': [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
      'E': [20.60, 41.20, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
      'F': [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
      'Gb': [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96],
      'G': [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96],
      'Ab': [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44],
      'A': [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
      'Bb': [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
      'B': [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
    }
  }

  return {
    webAudio: webAudio.current,
    playTone,
    stopTone,
    isPlaying,
    getNotes
  }
}

function getVco(audioContext, _frequency) {
  const vco = audioContext.createOscillator()
  vco.type = vco.TRIANGLE
  vco.frequency.value = _frequency
  vco.start()
  return vco
}

function getBiquadFilter(audioContext) {
  const biquadFilter = audioContext.createBiquadFilter()
  biquadFilter.type = 'lowpass'
  biquadFilter.frequency.value = 200
  return biquadFilter
}

function getReverb(audioContext) {
  const reverb = audioContext.createConvolver()

  const rate = audioContext.sampleRate
  const reverbTime = rate * 1
  const length = reverbTime
  const attack = 0.0001
  const decay = 0.1
  const release = reverbTime
  const impulse = audioContext.createBuffer(2, length, rate)
  const impulseL = impulse.getChannelData(0)
  const impulseR = impulse.getChannelData(1)
  const reverse = false

  for(let i = 0; i < length; i++) {
    const n = reverse ? length - i : i;
    impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay)
    impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay)
  }

  reverb.buffer = impulse

  return reverb
}

function getDistortion(audioContext) {
  const distortion = audioContext.createWaveShaper()
  distortion.curve = makeDistortionCurve(400)
  distortion.oversample = '4x'
  return distortion
}

function makeDistortionCurve(amount) {
  const k = typeof amount === "number" ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for(let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve
}