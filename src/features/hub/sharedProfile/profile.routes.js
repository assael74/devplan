// C:\projects\devplan\src\features\hub\sharedProfile\profile.routes.js
export function normalizeTabKey(tabs, tabKey, defaultTab) {
  const list = Array.isArray(tabs) ? tabs : []
  const fallback = String(defaultTab || list?.[0]?.key || 'info')
  const k = String(tabKey || '').trim().toLowerCase()

  const hit = list.find((t) => String(t?.key || '').trim().toLowerCase() === k)
  return hit ? String(hit.key) : fallback
}

export function getTabFromUrl({ tabs, defaultTab, tabKeyParam, searchParams }) {
  // priority: /:id/:tabKey
  const p1 = normalizeTabKey(tabs, tabKeyParam, defaultTab)

  // fallback: ?tab=
  const q = normalizeTabKey(tabs, searchParams?.get?.('tab'), defaultTab)

  // if param exists and valid -> use it, else query
  return tabKeyParam ? p1 : q
}

export function setTabInSearch(searchParams, tabs, defaultTab, tabKey) {
  const next = new URLSearchParams(searchParams)
  next.set('tab', normalizeTabKey(tabs, tabKey, defaultTab))
  return next
}
