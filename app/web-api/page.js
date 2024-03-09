import Link from 'next/link'

export default function WebAPI() {
  return (
    <main className='h-screen w-screen'>
      <ul>
        <li>
          <Link href='/web-api/speech-commands'>Speech Commands</Link>
        </li>
        <li>
          <Link href='/web-api/tone-js'>ToneJS</Link>
        </li>
        <li>
          <Link href='/web-api/web-audio'>Web Audio</Link>
        </li>
      </ul>
    </main>
  )
}