import Link from 'next/link'

export default function Home() {
  return (
    <main className='h-screen w-screen'>
      <ul>
        <li>
          <Link href='/apis'>APIs</Link>
        </li>
        <li>
          <Link href='/computer-vision'>Computer Vision</Link>
        </li>
        <li>
          <Link href='/three-js'>ThreeJS</Link>
        </li>
        <li>
          <Link href='/web-api'>Web API</Link>
        </li>
      </ul>
    </main>
  )
}