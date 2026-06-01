"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeShortcutListener() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "d" || event.key === "D") {
        const activeElement = document.activeElement
        if (activeElement) {
          const tagName = activeElement.tagName.toLowerCase()
          if (
            tagName === "input" ||
            tagName === "textarea" ||
            activeElement.hasAttribute("contenteditable") ||
            activeElement.closest("[contenteditable]")
          ) {
            return
          }
        }
        event.preventDefault()
        setTheme(resolvedTheme === "light" ? "dark" : "light")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [resolvedTheme, setTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeShortcutListener />
      {children}
    </NextThemesProvider>
  )
}
