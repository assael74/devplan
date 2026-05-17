// teamProfile/sharedLogic/games/insightsLogic/viewModel/common/insightMenu.model.js

export function getPrimaryTakeaway(brief) {
  const items = Array.isArray(brief?.items) ? brief.items : []
  
  const action = items.find((item) => item?.id === 'action_focus')
  if (action) return action

  const focus = items.find((item) => item?.type === 'focus')
  if (focus) return focus

  const risk = items.find((item) => item?.type === 'risk')
  if (risk) return risk

  const advantage = items.find((item) => item?.type === 'advantage')
  if (advantage) return advantage

  return null
}

export function buildPrimaryMenuItem(primaryTakeaway) {
  if (!primaryTakeaway) return null

  return {
    ...primaryTakeaway,
    menuId: `${primaryTakeaway.id || primaryTakeaway.type}-primary`,
    isPrimary: true,
  }
}

export function buildRestMenuItems(items, primaryTakeaway) {
  if (!Array.isArray(items)) return []

  return items
    .filter((item) => item?.id !== primaryTakeaway?.id)
    .map((item) => ({
      ...item,
      menuId: item.id || item.type || item.label,
      isPrimary: false,
    }))
}

export function buildMenuItems(items, primaryTakeaway) {
  if (!Array.isArray(items)) return []

  const primary = buildPrimaryMenuItem(primaryTakeaway)
  const rest = buildRestMenuItems(items, primaryTakeaway)

  return [primary, ...rest].filter(Boolean)
}

export function buildInsightModel({
  brief,
  data,
  fallbackText = 'אין תובנה זמינה כרגע.',
  fallbackLabel = 'תובנה',
  fallbackIcon = 'insights',
  resolveColor,
}) {
  const insight = data?.insight || {}
  const takeaway = getPrimaryTakeaway(brief)
  const items = Array.isArray(brief?.items) ? brief.items : []
  const menuItems = buildMenuItems(items, takeaway)

  const color = resolveColor({
    takeaway,
    insight,
    brief,
  })

  const label = takeaway?.label || insight?.title || fallbackLabel
  const text = takeaway?.text || insight?.text || fallbackText
  const icon = takeaway?.type === 'focus' ? 'target' : insight?.icon || fallbackIcon

  return {
    insight,
    takeaway,
    items,
    menuItems,
    color,
    label,
    text,
    icon,
  }
}
