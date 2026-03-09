// src/features/hub/helpers/map.js
export function buildIdMap(list) {
  const map = {}
  for (const x of list || []) if (x?.id) map[x.id] = x
  return map
}
