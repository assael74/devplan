export const safeArr = (x) => (Array.isArray(x) ? x : [])

export const uniqBy = (arr, keyFn) => {
  const m = new Map()
  safeArr(arr).forEach((x) => {
    const k = keyFn?.(x)
    if (!k) return
    if (!m.has(k)) m.set(k, x)
  })
  return Array.from(m.values())
}
