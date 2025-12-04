import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Mongolia Economic Forum - Монголын Эдийн Засгийн Форум",
  description:
    "The Mongolia Economic Forum is the country's premier discussion platform aimed at addressing economic and social development challenges and finding solutions.",
  keywords: ["Mongolia", "Economic Forum", "MEF", "Development", "Investment", "Ulaanbaatar"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
