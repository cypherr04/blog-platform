import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import MainNavigation from "@/components/MainNavigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainNavigation />
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  )
}
