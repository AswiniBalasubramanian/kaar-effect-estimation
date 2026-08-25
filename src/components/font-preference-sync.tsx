"use client"

import * as React from "react"
import { useFontPreference } from "@/hooks/use-font-preference"

export function FontPreferenceSync() {
  const fontPreference = useFontPreference()

  React.useEffect(() => {
    document.documentElement.setAttribute("data-font", fontPreference)
  }, [fontPreference])

  return null
}
