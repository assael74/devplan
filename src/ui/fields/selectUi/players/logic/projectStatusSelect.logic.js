// ui/fields/selectUi/players/logic/projectStatusSelect.logic.js

const clean = (v) => String(v ?? '').trim()

export function normalizeProjectStatus(item) {
  return {
    value: clean(item?.id),
    label: clean(item?.labelH || item?.label),
    idIcon: clean(item?.idIcon),
    color: item?.color || null,
    icCol: item?.icCol || null,
    raw: item,
  }
}

export function buildOptions(options = []) {
  return options
    .map(normalizeProjectStatus)
    .filter((x) => x.value)
}

export function findSelected(value, normalizedOptions = []) {
  const id = clean(value)
  if (!id) return null
  return normalizedOptions.find((o) => o.value === id) || null
}
