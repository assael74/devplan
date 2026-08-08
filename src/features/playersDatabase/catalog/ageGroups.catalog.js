// features/playersDatabase/catalog/ageGroups.catalog.js

const clean = value => String(value || '').trim()

export const PLAYERS_DATABASE_AGE_GROUPS_CATALOG = [
  {
    id: 'u19',
    label: 'נוער',
    aliases: [],
  },
  {
    id: 'u17',
    label: 'נערים א',
    aliases: ['נערים א׳'],
  },
  {
    id: 'u16',
    label: 'נערים ב',
    aliases: ['נערים ב׳'],
  },
  {
    id: 'u15',
    label: 'נערים ג',
    aliases: ['נערים ג׳'],
  },
  {
    id: 'u14',
    label: 'ילדים א',
    aliases: ['ילדים א׳'],
  },
  {
    id: 'u13',
    label: 'ילדים ב',
    aliases: ['ילדים ב׳'],
  },
]

export const resolveAgeGroupCatalogItem = value => {
  const target = clean(value)

  if (!target) return null

  return PLAYERS_DATABASE_AGE_GROUPS_CATALOG.find(item => (
    clean(item.id) === target ||
    clean(item.label) === target ||
    (item.aliases || []).some(alias => clean(alias) === target)
  )) || null
}

export const resolveAgeGroupLabel = ({ ageGroupId, ageGroupLabel } = {}) => {
  const item =
    resolveAgeGroupCatalogItem(ageGroupId) ||
    resolveAgeGroupCatalogItem(ageGroupLabel)

  return clean(item?.label || ageGroupLabel || ageGroupId || '-')
}
