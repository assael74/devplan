// features/playersDatabase/ui/pages/teamPage/logic/teamStatsMatch.logic.js

import { clean } from './teamPage.utils.js'

export const normalizePlayerNameValue = value => clean(value)
  .replace(/[.״"׳']/g, '')
  .replace(/\s+/g, ' ')
  .toLowerCase()

const buildPlayerNameVariants = value => {
  const normalizedName = normalizePlayerNameValue(value)
  const parts = normalizedName.split(' ').filter(Boolean)
  const variants = new Set()

  if (normalizedName) variants.add(normalizedName)
  if (parts.length === 2) variants.add(`${parts[1]} ${parts[0]}`)

  return variants
}

export const getRosterPlayerOptionValue = player => clean(
  player?.playerDocumentId ||
  player?.playerId ||
  player?.externalPlayerId ||
  player?.fullName
)

export const buildRosterLookup = players => {
  const names = new Set()
  const ids = new Set()
  const byName = new Map()
  const byOptionValue = new Map()

  players.forEach(player => {
    buildPlayerNameVariants(player.fullName).forEach(name => {
      names.add(name)
      if (!byName.has(name)) byName.set(name, player)
    })
    buildPlayerNameVariants(player.normalizedName).forEach(name => {
      names.add(name)
      if (!byName.has(name)) byName.set(name, player)
    })

    if (player.externalPlayerId) ids.add(clean(player.externalPlayerId))
    if (player.playerId) ids.add(clean(player.playerId))

    const optionValue = getRosterPlayerOptionValue(player)
    if (optionValue) byOptionValue.set(optionValue, player)
  })

  return {
    names,
    ids,
    byName,
    byOptionValue,
    players,
  }
}

export const findRosterPlayerByValue = (players, value) => {
  const optionValue = clean(value)
  if (!optionValue) return null

  return players.find(player => getRosterPlayerOptionValue(player) === optionValue) || null
}

export const findStatsRosterMatch = (row, rosterLookup) => {
  if (!row || !rosterLookup) return null

  const selectedPlayer = rosterLookup.byOptionValue?.get(clean(row.matchedPlayerId))
  if (selectedPlayer) return selectedPlayer

  const nameVariants = buildPlayerNameVariants(row.fullName)
  for (const name of nameVariants) {
    const matchedPlayer = rosterLookup.byName?.get(name)
    if (matchedPlayer) return matchedPlayer
  }

  return null
}

export const enrichStatsRowForPreview = (row, rosterLookup) => {
  const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
  const matchedName = matchedPlayer?.fullName || row.fullName || ''
  const pastedName = row.fullName || ''
  const isAlias = matchedPlayer
    && pastedName
    && normalizePlayerNameValue(pastedName) !== normalizePlayerNameValue(matchedName)

  return {
    ...row,
    fullName: matchedName,
    originalFullName: pastedName,
    aliases: isAlias ? [pastedName] : [],
    matchedPlayerId: matchedPlayer ? getRosterPlayerOptionValue(matchedPlayer) : '',
    matchedPlayerName: matchedPlayer?.fullName || '',
    rosterStatus: matchedPlayer ? 'regular' : 'unresolved',
    isYoungerAgeGroup: false,
  }
}


