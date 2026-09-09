"use client";

import * as React from "react";

export interface ConfigSet {
  id: string;
  name: string;
  description: string;
  clonedFrom: string;
  createdAt: string;
}

const STORAGE_KEY = "kee-config-sets";

type Listener = () => void;
const listeners = new Set<Listener>();

let cachedRaw: string | null = null;
let cachedSnapshot: ConfigSet[] = [];

function readAll(): ConfigSet[] {
  if (typeof window === "undefined") return cachedSnapshot;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedSnapshot = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedSnapshot = [];
  }
  return cachedSnapshot;
}

function writeAll(sets: ConfigSet[]) {
  const raw = JSON.stringify(sets);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSnapshot = sets;
  listeners.forEach((listener) => listener());
}

function subscribe(callback: Listener) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

const EMPTY_SNAPSHOT: ConfigSet[] = [];

function getServerSnapshot(): ConfigSet[] {
  return EMPTY_SNAPSHOT;
}

export function useConfigSets(): ConfigSet[] {
  return React.useSyncExternalStore(subscribe, readAll, getServerSnapshot);
}

export function getConfigSet(id: string): ConfigSet | undefined {
  return readAll().find((s) => s.id === id);
}

export function createConfigSet(input: {
  name: string;
  description: string;
  clonedFrom: string;
}): ConfigSet {
  const set: ConfigSet = {
    id: `config-set-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: input.name,
    description: input.description,
    clonedFrom: input.clonedFrom,
    createdAt: new Date().toISOString(),
  };
  writeAll([...readAll(), set]);
  return set;
}

export function renameConfigSet(id: string, name: string) {
  writeAll(readAll().map((s) => (s.id === id ? { ...s, name } : s)));
}

export function deleteConfigSet(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}
