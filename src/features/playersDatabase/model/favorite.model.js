// features/playersDatabase/model/favorite.model.js

import { cleanValue } from './value.model.js'

const normalizeBirthYear = value => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

export const buildFavoriteItem = ({
  entityId = '',
  displayName = '',
  birthYear = null,
  createdAt = null,
} = {}) => {
  const normalizedEntityId = cleanValue(entityId)
  const normalizedDisplayName = cleanValue(displayName)

  if (!normalizedEntityId) {
    throw new Error('Missing favorite entity id')
  }

  if (!normalizedDisplayName) {
    throw new Error('Missing favorite display name')
  }

  return {
    entityId: normalizedEntityId,
    displayName: normalizedDisplayName,
    birthYear: normalizeBirthYear(birthYear),
    createdAt,
  }
}

export const normalizeFavoriteItems = items => {
  const source = Array.isArray(items) ? items : []
  const byId = new Map()

  source.forEach(item => {
    try {
      const normalized = buildFavoriteItem(item)
      byId.set(normalized.entityId, normalized)
    } catch (error) {
      // Ignore malformed legacy rows instead of breaking the full favorites read.
    }
  })

  return Array.from(byId.values())
}

export const buildFavoritesMap = items => new Map(
  normalizeFavoriteItems(items).map(item => [item.entityId, item])
)
