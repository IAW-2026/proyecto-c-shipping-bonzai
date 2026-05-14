import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Newsreader, Manrope } from 'next/font/google'
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
        <body className={`${newsreader.variable} ${manrope.variable} antialiased bg-bone text-evergreen`}>
          <header className='flex justify-end items-center p-4 gap-4 h-16 fixed top-0 right-0 z-50'>
            <Show when='signed-out'>
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when='signed-in'>
              <UserButton />
            </Show>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}