const clean = value => String(value === undefined || value === null ? '' : value).trim()
const positiveInteger = value => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : 0
}

const buildIdentityKey = ({ playerId = '', seasonId = '', birthTeamId = '', birthTeamSlot = 0 } = {}) => {
  const normalizedPlayerId = clean(playerId)
  const normalizedSeasonId = clean(seasonId)
  const normalizedBirthTeamId = clean(birthTeamId)
  const normalizedSlot = positiveInteger(birthTeamSlot)
  if (!normalizedPlayerId || !normalizedSeasonId || !normalizedBirthTeamId || !normalizedSlot) return ''
  return [normalizedPlayerId, normalizedSeasonId, normalizedBirthTeamId, normalizedSlot].join('::')
}

const buildCanonicalRosterPlayerIdentities = ({ source = {} } = {}) => {
  const identities = []
  const incompletePlayers = []
  const duplicateIdentityKeys = []
  const seen = new Set()

  ;(Array.isArray(source.canonicalRosterPlayers) ? source.canonicalRosterPlayers : []).forEach((player, index) => {
    const identity = {
      playerId: clean(player?.playerId),
      seasonId: clean(source.seasonId || source.seasonKey),
      birthTeamId: clean(source.birthTeamId || source.teamId),
      birthTeamSlot: positiveInteger(source.birthTeamSlot || 1),
    }
    const key = buildIdentityKey(identity)
    if (!key) {
      incompletePlayers.push({ index, playerId: identity.playerId })
      return
    }
    if (seen.has(key)) {
      duplicateIdentityKeys.push(key)
      return
    }
    seen.add(key)
    identities.push({ ...identity, key })
  })

  return { identities, incompletePlayers, duplicateIdentityKeys }
}

const buildIndexIdentity = row => {
  const identity = {
    playerId: clean(row?.playerId),
    seasonId: clean(row?.seasonId),
    birthTeamId: clean(row?.birthTeamId || row?.teamId),
    birthTeamSlot: positiveInteger(row?.birthTeamSlot || row?.teamSlot),
  }
  return { ...identity, key: buildIdentityKey(identity) }
}

const evaluatePlayerSeasonIndexes = ({ source = {}, indexRows = [] } = {}) => {
  const expected = buildCanonicalRosterPlayerIdentities({ source })
  const indexesByIdentity = new Map()
  const indexesWithIncompleteIdentity = []

  ;(Array.isArray(indexRows) ? indexRows : []).forEach(row => {
    const identity = buildIndexIdentity(row)
    if (!identity.key) {
      indexesWithIncompleteIdentity.push(clean(row?.id))
      return
    }
    const rows = indexesByIdentity.get(identity.key) || []
    indexesByIdentity.set(identity.key, [...rows, clean(row?.id)])
  })

  const expectedKeys = new Set(expected.identities.map(identity => identity.key))
  const missingIdentityKeys = [...expectedKeys].filter(key => !indexesByIdentity.has(key))
  const foreignIdentityKeys = [...indexesByIdentity.keys()].filter(key => !expectedKeys.has(key))
  const duplicateIdentityKeys = [...indexesByIdentity.entries()]
    .filter(([, documentIds]) => documentIds.length !== 1)
    .map(([key]) => key)

  return {
    expectedCount: expected.identities.length,
    playerIndexCount: Array.isArray(indexRows) ? indexRows.length : 0,
    expectedIdentityKeys: [...expectedKeys],
    missingIdentityKeys,
    foreignIdentityKeys,
    duplicateIdentityKeys,
    canonicalRosterIdentityIncomplete: expected.incompletePlayers,
    canonicalRosterDuplicateIdentityKeys: expected.duplicateIdentityKeys,
    indexesWithIncompleteIdentity,
    valid: !(
      expected.incompletePlayers.length ||
      expected.duplicateIdentityKeys.length ||
      indexesWithIncompleteIdentity.length ||
      missingIdentityKeys.length ||
      foreignIdentityKeys.length ||
      duplicateIdentityKeys.length
    ),
  }
}

module.exports = {
  buildCanonicalRosterPlayerIdentities,
  buildIdentityKey,
  evaluatePlayerSeasonIndexes,
}