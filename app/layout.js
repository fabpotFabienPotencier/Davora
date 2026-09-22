import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Davora AI',
  description: 'A blazing fast, intelligent AI assistant.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

import PushNotificationManager from '../components/PushNotificationManager'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PushNotificationManager />
        {children}
      </body>
    </html>
  )
}
