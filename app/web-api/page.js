import Link from 'next/link'
import { routes } from '@/lib'

export const routemetadata = {
  title: 'WebAPI'
}

export default async function WebAPI() {
  // const pages = await routes.getPages({
  //   directory: '/web-api'
  // })
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