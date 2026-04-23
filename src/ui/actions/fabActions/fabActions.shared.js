// ui/actions/fabActions/fabActions.shared.js

import { iconUi } from '../../core/icons/iconUi.js'

export function pick(v, fallback) {
  return typeof v === 'function' ? v : fallback
}

export function noOp() {}

export function buildTaskFabAction({
  allowCreate = true,
  onAddTask = noOp,
  area = '',
  mode = '',
  taskContext = {},
}) {
  return {
    id: 'add-task',
    label: 'הוסף משימה אישית',
    icon: iconUi({ id: 'addTask' }),
    onClick: () =>
      onAddTask({
        workspace: taskContext?.workspace || '',
        url: taskContext?.url || '',
        contextArea: taskContext?.contextArea || area || '',
        contextMode: taskContext?.contextMode || mode || '',
      }),
    color: 'taskApp',
    disabled: !allowCreate,
  }
}

export function buildSectionItem(id, label, colorKey) {
  return {
    id,
    type: 'section',
    label,
    colorKey,
  }
}

export function buildDividerItem(id) {
  return {
    id,
    type: 'divider',
  }
}

function clean(list = []) {
  return (Array.isArray(list) ? list : []).filter(Boolean)
}

function appendSectionBlock(items, { sectionId, sectionLabel, colorKey, dividerId }) {
  const next = clean(items)
  if (!next.length) return []

  return [
    buildSectionItem(sectionId, sectionLabel, colorKey),
    ...next,
  ]
}

export function composeFabActions({
  primaryActions = [],
  taskAction = null,
  insightActions = [],
  primarySection = {
    id: 'section-actions',
    label: 'פעולות',
    colorKey: 'player',
  },
  taskSection = {
    id: 'section-task',
    label: 'משימה אישית',
    colorKey: 'taskApp',
  },
  insightsSection = {
    id: 'section-insights',
    label: 'תובנות',
    colorKey: 'team',
  },
} = {}) {
  const primary = clean(primaryActions)
  const insights = clean(insightActions)
  const result = []

  if (primary.length) {
    result.push(
      ...appendSectionBlock(primary, {
        sectionId: primarySection.id,
        sectionLabel: primarySection.label,
        colorKey: primarySection.colorKey,
      })
    )
  }

  if (taskAction) {
    if (result.length) {
      result.push(buildDividerItem('divider-task'))
    }

    result.push(
      ...appendSectionBlock([taskAction], {
        sectionId: taskSection.id,
        sectionLabel: taskSection.label,
        colorKey: taskSection.colorKey,
      })
    )
  }

  if (insights.length) {
    if (result.length) {
      result.push(buildDividerItem('divider-insights'))
    }

    result.push(
      ...appendSectionBlock(insights, {
        sectionId: insightsSection.id,
        sectionLabel: insightsSection.label,
        colorKey: insightsSection.colorKey,
      })
    )
  }

  return result
}
