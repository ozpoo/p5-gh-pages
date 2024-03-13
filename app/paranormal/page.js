import Link from 'next/link'
import { routes } from '@/lib'

export const routemetadata = {
  title: 'Paranormal'
}

export default async function APIs() {
  const pages = await routes.getPages({
    directory: '/paranormal'
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