"use client"

import * as React from "react"
import { useThemePreference } from "@/hooks/use-theme-preference"

function applyTheme(preference: string) {
  const isDark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.style.colorScheme = isDark ? "dark" : "light"
}

export function ThemePreferenceSync() {
  const themePreference = useThemePreference()

  React.useEffect(() => {
    applyTheme(themePreference)

    if (themePreference !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyTheme(themePreference)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [themePreference])

  return null
}
