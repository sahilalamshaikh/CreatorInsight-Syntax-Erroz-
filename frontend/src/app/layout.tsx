import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CreatorInsight',
  description: 'AI-powered social media growth platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8F8FC] text-[#1A1A2E] antialiased">
        {children}
      </body>
    </html>
  )
}