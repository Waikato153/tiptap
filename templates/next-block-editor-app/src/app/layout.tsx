import './globals.css'
import './style.scss'
import type { Metadata } from 'next'
import { Providers } from './providers'
import { SnackbarProvider } from '@/components/SnackbarTips/SnackbarTips';


import 'cal-sans'

import '@fontsource/inter/100.css'
import '@fontsource/inter/200.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://demos.tiptap.dev'),
  title: 'Fluid Business Management System',
  description:
    'Tiptap is a suite of open source content editing and real-time collaboration tools for developers building apps like Notion or Google Docs.',
  robots: 'noindex, nofollow',
  icons: [{ url: '/favicon.svg' }],
  twitter: {
    card: 'summary_large_image',
    site: '@tiptap_editor',
    creator: '@tiptap_editor',
  },
  openGraph: {
    title: 'Tiptap block editor template',
    description:
      'Tiptap is a suite of open source content editing and real-time collaboration tools for developers building apps like Notion or Google Docs.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full font-sans" lang="en">
      <body className="flex flex-col h-full">
        <SnackbarProvider>
            <Providers>
              <main className="h-full">{children}</main>
          </Providers>
        </SnackbarProvider>
      </body>
    </html>
  )
}
