import Link from 'next/link'
import { routes } from '@/lib'

export const routemetadata = {
  title: 'Computer Vision'
}

export default async function ComputerVision() {
  const pages = await routes.getPages({
    directory: '/computer-vision'
  })
  return (
    <main className='h-screen w-screen'>
      <ul>
        {pages.map(page =>
          <li>
            <Link href={page.slug}>{page.title}</Link>
          </li>
        )}
      </ul>
    </main>
  )
}