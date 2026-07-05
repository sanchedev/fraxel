export function isFuncComponent(obj: any): obj is FuncComponent {
  if (typeof obj !== 'function') return false
  if (Object.getOwnPropertyDescriptor(obj, 'prototype')?.writable !== true) return false
  return true
}

type FuncComponent = (...args: any[]) => any
