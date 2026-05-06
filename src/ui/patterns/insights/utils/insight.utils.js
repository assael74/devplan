// ui/patterns/insights/utils/insight.utils.js

export function getPrimaryItem(items = []) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    safeItems.find((item) => item?.id === 'action_focus') ||
    safeItems.find((item) => item?.type === 'focus') ||
    safeItems.find((item) => item?.type === 'risk') ||
    safeItems.find((item) => item?.type === 'advantage') ||
    safeItems[0] ||
    null
  )
}

export function getDetailItems(items = [], primaryItem = null) {
  const safeItems = Array.isArray(items) ? items : []

  if (!primaryItem) return safeItems

  return safeItems.filter((item) => item?.id !== primaryItem?.id)
}

export function buildMenuItems(items = [], primaryItem = null) {
  const safeItems = Array.isArray(items) ? items : []

  const primary = primaryItem
    ? {
        ...primaryItem,
        menuId: `${primaryItem.id || primaryItem.type || 'primary'}-primary`,
        isPrimary: true,
      }
    : null

  const rest = safeItems
    .filter((item) => item?.id !== primaryItem?.id)
    .map((item) => ({
      ...item,
      menuId: item.id || item.type || item.label,
      isPrimary: false,
    }))

  return [primary, ...rest].filter(Boolean)
}
