// src/features/playersDatabase/components/leagues/leagueUtils.js

const clean = value => String(value ?? '').trim()

const sameClean = (a, b) =>
  clean(a) && clean(a) === clean(b)

const sameIfBoth = (a, b) =>
  !clean(a) || !clean(b) || clean(a) === clean(b)

const normalizeName = value =>
  clean(value)
    .toLowerCase()
    .replace(/['"׳״]/g, '')
    .replace(/\s+/g, ' ')

const normalizeLooseName = value =>
  normalizeName(value)
    .replace(/\bפטל\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const namesOf = value => [
  value.clubName,
  value.teamName,
  value.sourceTeamName,
].map(normalizeName).filter(Boolean)

const hasSameName = (a, b) => {
  const aNames = new Set(namesOf(a))
  if (namesOf(b).some(name => aNames.has(name))) return true

  const looseA = namesOf(a).map(normalizeLooseName)
  const looseB = namesOf(b).map(normalizeLooseName)

  return looseA.some(aName =>
    looseB.some(bName =>
      aName &&
      bName &&
      (
        aName === bName ||
        aName.includes(bName) ||
        bName.includes(aName)
      )
    )
  )
}

const buildTeamSlotId = row => [
  clean(row.clubId),
  clean(row.ageGroupId),
  Number(row.teamSlot) || 1,
].filter(Boolean).join('_')

const buildTeamSeasonKey = row => [
  clean(row.clubId),
  clean(row.seasonId),
  clean(row.ageGroupId),
  Number(row.teamSlot) || 1,
  clean(row.leagueId),
].filter(Boolean).join('__')

const getTeamIndex = (teamsIndex, row) => {
  const teamSlotId = clean(row.teamSlotId) || buildTeamSlotId(row)
  const teamSeasonKey = clean(row.teamSeasonKey) || buildTeamSeasonKey(row)
  const indexRows = Object.entries(teamsIndex || {}).map(([key, value]) => ({
    key,
    ...(value || {}),
  }))
  const direct = teamsIndex[teamSeasonKey] || teamsIndex[teamSlotId]

  if (direct) {
    return {
      key: direct.key || teamSeasonKey,
      ...direct,
    }
  }

  return indexRows.find(item => {
    if (!item) return false

    if (sameClean(item.key, teamSeasonKey)) return true
    if (sameClean(item.key, teamSlotId)) return true
    if (sameClean(item.teamSeasonKey, teamSeasonKey)) return true
    if (sameClean(item.teamSlotId, teamSlotId)) return true
    if (sameClean(item.externalTeamId, row.externalTeamId)) return true

    if (
      sameClean(item.teamSlotId, teamSlotId) ||
      sameClean(item.teamSeasonKey, teamSeasonKey)
    ) {
      return (
        sameIfBoth(item.seasonId, row.seasonId) &&
        sameIfBoth(item.ageGroupId, row.ageGroupId)
      )
    }

    if (
      sameClean(item.clubId, row.clubId) &&
      Number(item.teamSlot || 1) === Number(row.teamSlot || 1) &&
      sameIfBoth(item.seasonId, row.seasonId) &&
      sameIfBoth(item.ageGroupId, row.ageGroupId)
    ) {
      return true
    }

    return (
      sameClean(item.clubId, row.clubId) &&
      sameIfBoth(item.seasonId, row.seasonId) &&
      sameIfBoth(item.ageGroupId, row.ageGroupId)
    )
  }) || indexRows.find(item => {
    if (!item) return false

    return (
      hasSameName(item, row) &&
      Number(item.teamSlot || 1) === Number(row.teamSlot || 1) &&
      sameIfBoth(item.seasonId, row.seasonId) &&
      sameIfBoth(item.ageGroupId, row.ageGroupId)
    )
  }) || {}
}

export const getLeagueRegionLabel = value => {
  const region = clean(value).toLowerCase()

  if (region === 'north') return 'צפון'
  if (region === 'south') return 'דרום'

  return clean(value) || 'כללי'
}

export const getLeagueLevelLabel = level => {
  const numericLevel = Number(level)

  if (numericLevel === 1) return 'על'
  if (numericLevel === 2) return 'לאומית'
  if (numericLevel === 3) return 'ארצית'
  if (numericLevel === 4) return 'מחוזית'

  return 'לא זוהתה'
}

export const getLeagueSeasonRows = league => (
  Object.entries(league?.seasons || {}).map(([key, season]) => ({
    key,
    ...season,
  }))
)

export const getPrimaryLeagueSeason = league => (
  getLeagueSeasonRows(league)[0] || null
)

export const buildLeagueTableRows = ({
  league,
  season,
  snapshot,
}) => {
  const teamsIndex = league?.teamsIndex || {}

  if (Array.isArray(snapshot?.rows) && snapshot.rows.length) {
    return snapshot.rows.map((row, index) => {
      const seasonId = row.seasonId || snapshot.seasonId || season?.seasonId || ''
      const ageGroupId = row.ageGroupId || snapshot.ageGroupId || season?.ageGroupId || league?.ageGroupId || ''
      const ageGroupLabel = row.ageGroupLabel || snapshot.ageGroupLabel || season?.ageGroupLabel || league?.ageGroupLabel || ''
      const leagueId = league?.id || row.leagueId || snapshot.leagueId || season?.leagueId || ''
      const leagueName = row.leagueName || snapshot.leagueName || season?.leagueName || league?.leagueName || ''
      const teamSlot = Number(row.teamSlot) || 1
      const teamSlotId = row.teamSlotId || buildTeamSlotId({
        ...row,
        ageGroupId,
        teamSlot,
      })
      const teamSeasonKey = row.teamSeasonKey || buildTeamSeasonKey({
        ...row,
        seasonId,
        ageGroupId,
        teamSlot,
        leagueId,
      })
      const teamIndex = getTeamIndex(teamsIndex, {
        ...row,
        seasonId,
        ageGroupId,
        leagueId,
        teamSlot,
        teamSlotId,
        teamSeasonKey,
      })

      return {
        id: row.clubId || row.rowId || `snapshot-${index + 1}`,
        rowId: row.rowId || `row-${index + 1}`,
        leaguePosition:
          row.leaguePosition ??
          row.position ??
          index + 1,
        clubName:
          row.clubName ||
          `מועדון ${index + 1}`,
        clubId: row.clubId || '',
        seasonId,
        ageGroupId,
        ageGroupLabel,
        leagueId,
        leagueName,
        externalTeamId: row.externalTeamId || '',
        sourceLeagueName: row.sourceLeagueName || snapshot.sourceLeagueName || '',
        sourceTeamName: row.sourceTeamName || row.teamName || row.clubName || '',
        teamName: row.teamName || row.sourceTeamName || row.clubName || '',
        teamSlot,
        teamSlotId,
        teamSeasonKey,
        teamIndex,
        playersCount: Number(teamIndex.playersCount) || 0,
        statsCount: Number(teamIndex.statsCount) || 0,
        scoutProfilesCount: Number(teamIndex.scoutProfilesCount) || 0,
        profileCounts: teamIndex.profileCounts || {},
        rawProfileCounts: teamIndex.rawProfileCounts || {},
        reliabilityCounts: teamIndex.reliabilityCounts || {},
        games: Number(row.games) || 0,
        wins: Number(row.wins) || 0,
        draws: Number(row.draws) || 0,
        losses: Number(row.losses) || 0,
        goalsFor: Number(row.goalsFor) || 0,
        goalsAgainst: Number(row.goalsAgainst) || 0,
        goalDifference: Number(row.goalDifference) || 0,
        points: Number(row.points) || 0,
        placeholder: false,
      }
    })
  }

  const clubsCount = Number(season?.clubsCount) || 0
  const clubIds = Array.isArray(season?.clubIds)
    ? season.clubIds
    : []

  return Array.from({ length: clubsCount }, (_, index) => {
    const leaguePosition = index + 1
    const clubId = clean(clubIds[index])

    return {
      id: clubId || `placeholder-${leaguePosition}`,
      leaguePosition,
      clubName: clubId || `מועדון ${leaguePosition}`,
      games: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      placeholder: !clubId,
    }
  })
}
