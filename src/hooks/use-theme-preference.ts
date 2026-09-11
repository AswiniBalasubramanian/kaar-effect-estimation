"use client"

import * as React from "react"

export const THEME_STORAGE_KEY = "kee-theme-preference"
export type ThemePreference = "light" | "dark" | "system"
const DEFAULT_THEME: ThemePreference = "system"

type Listener = () => void
const listeners = new Set<Listener>()

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system"
}

function subscribe(callback: Listener) {
  listeners.add(callback)
  window.addEventListener("storage", callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot(): ThemePreference {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isThemePreference(stored) ? stored : DEFAULT_THEME
}

function getServerSnapshot(): ThemePreference {
  return DEFAULT_THEME
}

export function setThemePreference(value: ThemePreference) {
  window.localStorage.setItem(THEME_STORAGE_KEY, value)
  listeners.forEach((listener) => listener())
}

export function useThemePreference() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
