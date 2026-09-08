"use client"

import * as React from "react"

export const FONT_STORAGE_KEY = "kee-font-preference"
export type FontPreference = "geist" | "figtree" | "dm-sans"
const DEFAULT_FONT: FontPreference = "geist"

type Listener = () => void
const listeners = new Set<Listener>()

function isFontPreference(value: string | null): value is FontPreference {
  return value === "geist" || value === "figtree" || value === "dm-sans"
}

function subscribe(callback: Listener) {
  listeners.add(callback)
  window.addEventListener("storage", callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot(): FontPreference {
  const stored = window.localStorage.getItem(FONT_STORAGE_KEY)
  return isFontPreference(stored) ? stored : DEFAULT_FONT
}

function getServerSnapshot(): FontPreference {
  return DEFAULT_FONT
}

export function setFontPreference(value: FontPreference) {
  window.localStorage.setItem(FONT_STORAGE_KEY, value)
  listeners.forEach((listener) => listener())
}

export function useFontPreference() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
