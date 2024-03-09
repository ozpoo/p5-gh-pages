import Link from 'next/link'

export default function APIs() {
  return (
    <main className='h-screen w-screen'>
      <ul>
        <li>
          <Link href='/apis/national-archives-catalogue'>National Archives Catalogue</Link>
        </li>
      </ul>
    </main>
  )
}