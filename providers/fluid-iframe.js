'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function FluidIframeProvider({ children }) {
  const pathname = usePathname()

	useEffect(() => {
    createFluidIframe()
  }, [pathname])

  function createFluidIframe(width, height) {
    const iframes = document.querySelectorAll('iframe')
    iframes.forEach(iframe => {
      const aspectRatio = iframe.height / iframe.width * 100

      iframe.width = '100%'
      iframe.height = '100%'

      iframe.style.position = 'absolute'
      iframe.style.width = '100%'
      iframe.style.height = '100%'

      const wrapper = document.createElement('div')
      wrapper.style.position = 'relative'
      wrapper.style.width = '100%'
      wrapper.style.paddingBottom = aspectRatio + '%'

      iframe.parentNode.insertBefore(wrapper, iframe)
      wrapper.appendChild(iframe)
    })
  }

  return children
}