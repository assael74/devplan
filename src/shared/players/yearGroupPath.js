// src/shared/players/yearGroupPath.js

const clean = value => String(value ?? '').trim()

export const YEAR_GROUP_PATH = [
  'u13',
  'u14',
  'u15',
  'u16',
  'u17',
  'u19',
]

export const getUpperAgeGroupId = ageGroupId => {
  const index = YEAR_GROUP_PATH.indexOf(clean(ageGroupId).toLowerCase())

  return index >= 0 ? YEAR_GROUP_PATH[index + 1] || '' : ''
}

const toNumberOrNull = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const getLeagueLevel = team => toNumberOrNull(
  team.leagueLevel ?? team.level ?? team.league?.level
)

const getTeamSlot = team => {
  const n = Number(team.teamSlot)
  return Number.isInteger(n) && n > 0 ? n : 1
}

const buildTeamKey = team => [
  clean(team.clubId),
  clean(team.seasonId),
  clean(team.ageGroupId).toLowerCase(),
  getTeamSlot(team),
].join('__')

const isHigherLeague = (currentLevel, upperLevel) => (
  currentLevel !== null &&
  upperLevel !== null &&
  currentLevel < upperLevel
)

const scoreGap = (currentLevel, upperLevel) => (
  currentLevel === null || upperLevel === null ? 0 : upperLevel - currentLevel
)

const normalizeTeam = team => ({
  ...team,
  clubId: clean(team.clubId),
  clubName: clean(team.clubName || team.teamName),
  seasonId: clean(team.seasonId),
  ageGroupId: clean(team.ageGroupId).toLowerCase(),
  ageGroupLabel: clean(team.ageGroupLabel),
  teamSlot: getTeamSlot(team),
  leagueId: clean(team.leagueId),
  leagueName: clean(team.leagueName || team.league?.leagueName || team.league?.name),
  leagueLevel: getLeagueLevel(team),
})

export function findYearGroupsBlockedByUpperLeague(teams = [], options = {}) {
  const sameTeamSlotOnly = options.sameTeamSlotOnly !== false
  const normalized = (Array.isArray(teams) ? teams : [])
    .map(normalizeTeam)
    .filter(team => team.clubId && team.seasonId && team.ageGroupId)
  const teamsByKey = new Map(normalized.map(team => [buildTeamKey(team), team]))

  return normalized.flatMap(currentTeam => {
    const upperAgeGroupId = getUpperAgeGroupId(currentTeam.ageGroupId)
    if (!upperAgeGroupId) return []

    const candidates = sameTeamSlotOnly
      ? [
        teamsByKey.get(buildTeamKey({
          ...currentTeam,
          ageGroupId: upperAgeGroupId,
        })),
      ].filter(Boolean)
      : normalized.filter(team => (
        team.clubId === currentTeam.clubId &&
        team.seasonId === currentTeam.seasonId &&
        team.ageGroupId === upperAgeGroupId
      ))

    return candidates
      .filter(upperTeam => isHigherLeague(currentTeam.leagueLevel, upperTeam.leagueLevel))
      .map(upperTeam => ({
        id: [
          currentTeam.clubId,
          currentTeam.seasonId,
          currentTeam.ageGroupId,
          currentTeam.teamSlot,
          upperTeam.ageGroupId,
          upperTeam.teamSlot,
        ].join('__'),
        clubId: currentTeam.clubId,
        clubName: currentTeam.clubName || upperTeam.clubName,
        seasonId: currentTeam.seasonId,
        currentTeam,
        upperTeam,
        upperAgeGroupId,
        levelGap: scoreGap(currentTeam.leagueLevel, upperTeam.leagueLevel),
        reason: 'upper_year_group_lower_league',
      }))
  }).sort((a, b) => {
    if (b.levelGap !== a.levelGap) return b.levelGap - a.levelGap
    if (a.seasonId !== b.seasonId) return b.seasonId.localeCompare(a.seasonId)
    return clean(a.clubName).localeCompare(clean(b.clubName), 'he')
  })
}
