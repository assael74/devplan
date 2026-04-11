// src/ui/fields/selectUi/tasks/logic/tasksSelect.logic.js

const clean = (t) => String(t ?? '').trim()

export function normalizeTaskOption(item) {
  return {
    ...item,
    value: clean(item?.id),
    label: clean(item?.label || item?.name),
    subLabel: clean(item?.subLabel || item?.description),
    idIcon: clean(item?.idIcon),
    color: clean(item?.color),
    searchKey: [clean(item?.label), clean(item?.name), clean(item?.description)]
      .filter(Boolean)
      .join(' • ')
      .toLowerCase(),
  }
}

export function buildOptions(options = []) {
  return (Array.isArray(options) ? options : [])
    .map((item) => normalizeTaskOption(item))
    .filter((item) => item.value)
}

export function findSelected(value, normalizedOptions = []) {
  const id = clean(value)
  if (!id) return null
  return normalizedOptions.find((o) => o.value === id) || null
}

export function formatAff(name, label) {
  const parts = [clean(name), clean(label)].filter(Boolean)
  return parts.join(' • ')
}
