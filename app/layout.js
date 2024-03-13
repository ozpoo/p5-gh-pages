import Link from 'next/link'
import { routes } from '@/lib'

import '@/style/globals.sass'

import {
  Karla,
  Roboto_Mono
} from 'next/font/google'

const roboto_mono = Roboto_Mono({
  // weight: ['400', '700'],
  // style: ['normal', 'italic'],
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  display: 'swap',
})

const karla = Karla({
  // weight: ['400', '700'],
  // style: ['normal', 'italic'],
  variable: '--font-karla',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Oz — Eric Andren | Creative Technologist',
  description: 'Explore the work of Eric "Oz" Andren, an esteemed Iowa State University professor in the interdisciplinary fields of Graphic Design and Human Computer Interaction. His work not only bridges the gap between design, art, and engineering, but also explores their profound impact on society. Learn about his innovative contributions across Graphic Design, UX Design, Software Engineering, and Creative Technology - where innovation meets fun.',
}

export default async function RootLayout({ children }) {
  const pages = await routes.getPages()
  const groups = Object.groupBy(pages, ({ parent }) => parent)

  return (
    <html lang='en'>
      <body className={roboto_mono.variable + ' ' + karla.variable}>
        <div className='flex'>
          <div className='w-56 shrink-0 border-r-[0.25rem] border-neutral-900 h-screen sticky top-0 overflow-scroll'>
            <ul className='py-8'>
              {groups['/'].map(parent =>
                <>
                  <li key={'page-' + parent.slug}>
                    <Link className='text-sm font-sans font-bold block py-2.5 leading-none px-4 hover:bg-neutral-800/60 rounded-full' href={parent.slug}>{parent.title}</Link>
                  </li>
                  <ul className='ml-4 mb-4'>
                    {pages.filter(page => page.parent === parent.slug).map(page =>
                      <li key={'page-' + page.slug}>
                        <Link className='text-xs block py-2 leading-none px-4 hover:bg-neutral-800/60 rounded-full' href={page.slug}>{page.title}</Link>
                      </li>
                    )}
                  </ul>
                </>
              )}
              {/*{pages.map(page =>
                <li key={'page-' + page.slug}>
                  <Link className='block py-2.5 leading-none px-4 hover:bg-neutral-800/40 rounded-full' href={page.slug}>{page.title}</Link>
                </li>
              )}*/}
            </ul>
          </div>
          <div className='flex-1 overflow-x-hidden'>
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}