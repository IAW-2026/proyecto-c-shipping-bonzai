import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Newsreader, Manrope } from 'next/font/google'
import { UserBubble } from '@/components/UserBubble'
import './globals.css'

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Shipping App',
  description: 'Ecosistema botanico de envios',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang='es'
        className={`${newsreader.variable} ${manrope.variable} antialiased`}
      >
        <body className={`${newsreader.variable} ${manrope.variable} antialiased bg-background text-primary`}>
          {children}
          <UserBubble />
        </body>
      </html>
    </ClerkProvider>
  )
}