import Link from 'next/link'
import { routes } from '@/lib'

export const routemetadata = {
  title: 'ThreeJS'
}

export default async function ThreeJS() {
  const pages = await routes.getPages({
    directory: '/three-js'
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