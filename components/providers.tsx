"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <NextThemesProvider {...props} enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
      </NextThemesProvider>
    </SessionProvider>
  )
}
