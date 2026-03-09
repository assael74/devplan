// shared/meetings/filters/meetingsFilters.config.js

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { MEETING_TYPES, MEETING_STATUSES } from '../meetings.constants.js'

function toKey(v) {
  return String(v || '').trim().toLowerCase()
}

function withAllOption(list, allLabel, allIconId) {
  const base = Array.isArray(list) ? list : []

  const mapped = base.map((x) => {
    const id = x?.id
    const labelH = x?.labelH || x?.label || x?.lable || ''
    return {
      value: String(id || ''),
      label: String(labelH || '').trim() || String(id || ''),
      startDecorator: x?.idIcon ? iconUi({ id: x.idIcon }) : null,
      disabled: Boolean(x?.disabled),
    }
  })

  return [
    {
      value: 'all',
      label: allLabel || 'הכל',
      startDecorator: iconUi({ id: allIconId || 'filter' }),
      disabled: false,
    },
    ...mapped,
  ]
}

export const meetingsInitialFilters = {
  statusId: 'all',
  typeId: 'all',
  timeScope: 'all',
  monthKey: '', // MM-YYYY
  query: '', // free text
}

export const meetingsFilterGroups = [
  {
    key: 'statusId',
    title: 'סטטוס',
    options: withAllOption(MEETING_STATUSES, 'הכל', 'filter'),
  },
  {
    key: 'typeId',
    title: 'סוג',
    options: withAllOption(MEETING_TYPES, 'הכל', 'meetings'),
  },
  {
    key: 'timeScope',
    title: 'זמן',
    options: [
      { value: 'all', label: 'הכל', startDecorator: iconUi({ id: 'time' }) },
      { value: 'future', label: 'עתידיים', startDecorator: iconUi({ id: 'upComing' }) },
      { value: 'past', label: 'עבר', startDecorator: iconUi({ id: 'history' }) },
    ],
  },
]

// monthKey/query הם fields (לא chips), לכן rules בלבד
export const meetingsFilterRules = {
  statusId: (iVal, fVal) => !fVal || fVal === 'all' || toKey(iVal) === toKey(fVal),
  typeId: (iVal, fVal) => !fVal || fVal === 'all' || toKey(iVal) === toKey(fVal),

  timeScope: (iVal, fVal, item) => {
    if (!fVal || fVal === 'all') return true
    if (fVal === 'future') return Boolean(item?.isFuture)
    if (fVal === 'past') return !Boolean(item?.isFuture)
    return true
  },

  // monthKey: מצפה ל-MM-YYYY (כמו בנרמול)
  monthKey: (iVal, fVal) => {
    const v = String(fVal || '').trim()
    if (!v) return true
    return String(iVal || '') === v
  },

  // query: חיפוש חופשי (כולל notes בלבד, לפי הסטנדרט שלך)
  query: (iVal, fVal, item) => {
    const q = toKey(fVal)
    if (!q) return true
    const blob = toKey(
      `${item?.notes || ''} ${item?.typeLabel || ''} ${item?.statusLabel || ''} ${item?.date || ''} ${item?.time || ''}`
    )
    return blob.includes(q)
  },
}
