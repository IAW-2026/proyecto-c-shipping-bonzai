import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Shipping App',
  description: 'Ecosistema botánico de envíos',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className='flex justify-end items-center p-4 gap-4 h-16 border-b'>
            <Show when='signed-out'>
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when='signed-in'>
              <UserButton />
            </Show>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}