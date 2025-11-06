import './globals.css'
import 'leaflet/dist/leaflet.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['vietnamese', 'latin'] })

export const metadata: Metadata = {
  title: 'Ăn Ăn Sài Gòn - Khám phá ẩm thực Sài Gòn',
  description: 'Ăn tại Sài Gòn',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
