"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} themes={["light", "dark", "light-pink", "dark-pink"]}>
      {children}
    </NextThemesProvider>
  )
}
