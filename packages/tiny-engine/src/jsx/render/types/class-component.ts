export function isClassComponent(obj: any): obj is ClassComponent {
  if (typeof obj !== 'function') return false
  if (Object.getOwnPropertyDescriptor(obj, 'prototype')?.writable !== false) return false
  return true
}

type ClassComponent = new (...args: any[]) => any
