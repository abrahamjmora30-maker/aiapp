import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Must-Order',
  description: 'Never order the wrong thing again. Find the best dishes at any restaurant.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-primary">
                    {process.env.NEXT_PUBLIC_APP_NAME || 'Must-Order'}
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/nearby" className="text-sm hover:text-primary">
                    Nearby
                  </a>
                  <a href="/import" className="text-sm hover:text-primary">
                    Import
                  </a>
                </div>
              </nav>
            </div>
          </header>
          <main>
            {children}
          </main>
          <footer className="border-t mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-sm text-muted-foreground">
                <p>© 2024 Must-Order. Never order the wrong thing again.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
