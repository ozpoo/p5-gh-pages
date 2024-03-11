import Link from 'next/link'
import { routes } from '@/lib'

export const routemetadata = {
  title: 'Home'
}

export default async function APIs() {
  const pages = await routes.getPages()
  return (
    <main className='h-screen w-screen'>
      <ul>
        {pages.map(page =>
          <li key={'page-' + page.slug}>
            <Link href={page.slug}>{page.title}</Link>
          </li>
        )}
      </ul>
    </main>
  )
}