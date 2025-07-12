import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { NotificationProvider } from "@/components/notification-provider"
import { ClientOnly } from "@/components/client-only"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skill Swap Platform",
  description: "Trade your skills with others in the community.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers attribute="class" defaultTheme="dark" enableSystem>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen">
              <ClientOnly>
                <Header />
              </ClientOnly>
              <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
            </div>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  )
}
