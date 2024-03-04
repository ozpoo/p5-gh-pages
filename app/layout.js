import { Inter } from 'next/font/google'
import './globals.sass'

const inter = Inter({
  subsets: ['latin']
})

export const metadata = {
  title: 'Oz — Eric Andren | Creative Technologist',
  description: 'Explore the work of Eric "Oz" Andren, an esteemed Iowa State University professor in the interdisciplinary fields of Graphic Design and Human Computer Interaction. His work not only bridges the gap between design, art, and engineering, but also explores their profound impact on society. Learn about his innovative contributions across Graphic Design, UX Design, Software Engineering, and Creative Technology - where innovation meets fun.',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}