import { FluidIframeProvider } from '@/providers'

export default async function ParanormalLayout({ children }) {
  return (
    <FluidIframeProvider>
      <main className='p-8 space-y-12 prose prose-neutral prose-invert max-w-2xl mx-auto'>
        {children}
      </main>
    </FluidIframeProvider>
  )
}