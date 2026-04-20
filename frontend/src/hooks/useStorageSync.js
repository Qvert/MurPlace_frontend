import { useEffect } from 'react'

export default function useStorageSync(syncFn, options = {}) {
  const { eventNames = [], deps = [] } = options

  useEffect(() => {
    if (typeof syncFn !== 'function') return

    syncFn()

    window.addEventListener('storage', syncFn)
    eventNames.forEach(eventName => {
      window.addEventListener(eventName, syncFn)
    })

    return () => {
      window.removeEventListener('storage', syncFn)
      eventNames.forEach(eventName => {
        window.removeEventListener(eventName, syncFn)
      })
    }
  }, deps)
}
