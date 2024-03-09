import Link from 'next/link'

export default function ComputerVision() {
  return (
    <main className='h-screen w-screen'>
      <ul>
        <li>
          <Link href='/computer-vision/body-pose'>Body Pose</Link>
        </li>
        <li>
          <Link href='/computer-vision/face-api'>Face API</Link>
        </li>
        <li>
          <Link href='/computer-vision/face-emotion'>Face Emotion</Link>
        </li>
        <li>
          <Link href='/computer-vision/face-landmarker'>Face Landmarker</Link>
        </li>
        <li>
          <Link href='/computer-vision/face-mesh'>Face Mesh</Link>
        </li>
        <li>
          <Link href='/computer-vision/hand-gesture'>Hand Gesture</Link>
        </li>
        <li>
          <Link href='/computer-vision/hand-pose'>Hand Pose</Link>
        </li>
        <li>
          <Link href='/computer-vision/image-segmentor'>Image Segmentor</Link>
        </li>
      </ul>
    </main>
  )
}