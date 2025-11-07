import './globals.css'
import 'leaflet/dist/leaflet.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
  title: 'Ăn Ăn Sài Gòn - Khám phá ẩm thực Sài Gòn',
  description: 'Khám phá những quán ăn ngon tại Sài Gòn với đánh giá cao từ thực khách. Random quán ăn theo quận, loại món, và đánh giá để tìm địa điểm ăn uống phù hợp nhất.',
  keywords: ['ăn uống Sài Gòn', 'quán ăn ngon', 'ẩm thực Sài Gòn', 'random quán ăn', 'đánh giá quán ăn'],
  authors: [{ name: 'Ăn Ăn Sài Gòn' }],
  openGraph: {
    title: 'Ăn Ăn Sài Gòn - Khám phá ẩm thực Sài Gòn',
    description: 'Không biết ăn gì hôm nay? Hãy random và khám phá món ngon tại Sài Gòn!',
    type: 'website',
    locale: 'vi_VN',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#0891b2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
