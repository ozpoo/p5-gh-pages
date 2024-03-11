import Link from 'next/link'
import { routes } from '@/lib'

import './globals.sass'

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
  return (
    <html lang='en'>
      <body className={roboto_mono.variable + ' ' + karla.variable}>
        <div className='flex'>
          <div className='flex-1 max-w-xs shrink-0'>
            <ul className='px-3 py-8'>
              {pages.map(page =>
                <li key={'page-' + page.slug}>
                  <Link className='text-sm' href={page.slug}>{page.title}</Link>
                </li>
              )}
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