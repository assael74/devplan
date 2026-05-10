// playerProfile/sharedLogic/games/insightsDrawer/cards/view.shared.js

const getItems = ({ brief = {} } = {}) => {
  return Array.isArray(brief?.items)
    ? brief.items.filter(Boolean)
    : []
}

export const getPrimaryItem = ({ brief = {} } = {}) => {
  const items = getItems({ brief })

  return (
    items.find((item) => item?.id === 'action_focus') ||
    items.find((item) => item?.type === 'focus') ||
    items.find((item) => item?.type === 'risk') ||
    items.find((item) => item?.type === 'advantage') ||
    items[0] ||
    null
  )
}

const getTakeawayText = ({ item, brief } = {}) => {
  return (
    item?.takeaway ||
    item?.summary ||
    item?.actionText ||
    item?.text ||
    brief?.takeaway ||
    brief?.summary ||
    'אין תובנה זמינה כרגע.'
  )
}

const buildCleanTakeawayItem = ({ item, brief, label = 'תובנה' } = {}) => {
  if (!item) return null

  return {
    ...item,
    label,
    actionLabel: label,
    text: getTakeawayText({
      item,
      brief,
    }),
  }
}

const buildSingleTakeawayDetail = ({ item, brief, mainId = 'main_takeaway' } = {}) => {
  if (!item) return []

  return [
    {
      id: mainId,
      label: 'שורה תחתונה',
      text: getTakeawayText({
        item,
        brief,
      }),
    },
  ]
}

export const buildTakeawayModel = ({
  brief,
  metrics = [],
  mainId = 'main_takeaway',
  icon = 'insights',
  value = null,
  emptyText = 'כאן תופיע תובנה מקצועית.',
  label = 'תובנה',
} = {}) => {
  const item = getPrimaryItem({ brief })

  const cleanItem = buildCleanTakeawayItem({
    item,
    brief,
    label,
  })

  return {
    item: cleanItem,
    items: cleanItem ? [cleanItem] : [],
    details: buildSingleTakeawayDetail({
      item: cleanItem,
      brief,
      mainId,
    }),
    icon,
    value: value || cleanItem?.value,
    emptyText,
    metrics,
  }
}
