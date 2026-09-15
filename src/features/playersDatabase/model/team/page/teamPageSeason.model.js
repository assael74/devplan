import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { PLAYERS_DATABASE_CURRENT_SEASON_KEY } from '../../../catalog/seasons.catalog.js'
import { resolveAgeGroupLabel } from '../../../catalog/ageGroups.catalog.js'
import { isSameSeason, normalizeSeasonIdentity, normalizeSeasonLookupKey } from '../../shared/season.model.js'
import { normalizeTeamIdentity } from '../teamIdentity.model.js'
import { cleanValue } from '../../shared/value.model.js'

const TEAM_PAGE_FUTURE_SEASON_KEY = PLAYERS_DATABASE_CURRENT_SEASON_KEY

const resolveSeasonStartYear = seasonKey => {
  const match = cleanValue(seasonKey).match(/^(\d{2})[\/_-](\d{2})$/)
  return match ? 2000 + Number(match[1]) : null
}

const resolveSeasonAgeGroupLabel = ({ seasonKey = '', birthYear = null, ageGroupId = '', ageGroupLabel = '' } = {}) => {
  const startYear = resolveSeasonStartYear(seasonKey)
  const ageGroupNumber = startYear && birthYear
    ? startYear - Number(birthYear) + 1
    : null

  if (ageGroupNumber) {
    return resolveAgeGroupLabel({
      ageGroupId: `u${ageGroupNumber}`,
    })
  }

  return resolveAgeGroupLabel({
    ageGroupId,
    ageGroupLabel,
  })
}


const resolveLeagueOptionLabel = ({ season = {}, leagueId = '' } = {}) => {
  const directLabel = cleanValue(
    season?.leagueName ||
    season?.leagueLabel
  )
  if (directLabel) return directLabel

  const catalogLeague = PLAYERS_DATABASE_LEAGUES_CATALOG.find(item => (
    cleanValue(item?.id) === cleanValue(leagueId)
  ))

  return cleanValue(catalogLeague?.name || catalogLeague?.leagueName || leagueId)
}

const resolveSeasonSortValue = seasonKey => {
  const match = cleanValue(seasonKey).match(/^(\d{2})[\/_-](\d{2})$/)
  return match ? Number(match[1]) : 0
}

const resolveExpectedBirthYear = ({ teamDoc = {}, teamId = '' } = {}) => {
  const direct = Number(
    teamDoc?.birthYear ||
    teamDoc?.identity?.birthYear ||
    teamDoc?.metadata?.birthYear ||
    0
  )
  if (direct) return direct

  const match = cleanValue(teamId).match(/(?:^|_)(19|20)\d{2}(?:_|$)/)
  return match ? Number(match[0].replace(/_/g, '')) : null
}

const resolveOptionTeamName = ({ season = {}, teamDoc = {} } = {}) => cleanValue(
  season?.displayName ||
  season?.teamName ||
  teamDoc?.displayName ||
  teamDoc?.teamName ||
  teamDoc?.name ||
  'קבוצה'
)

const buildSeasonOption = ({ season, target, leagueId = '', teamDoc = {} }) => {
  const identity = normalizeSeasonIdentity({ season })
  const seasonKey = normalizeSeasonLookupKey(identity.seasonKey || identity.seasonId)
  const birthYear = Number(season?.birthYear || teamDoc?.birthYear || 0) || null
  const resolvedLeagueId = cleanValue(season?.leagueId || leagueId)
  const leagueName = resolveLeagueOptionLabel({
    season,
    leagueId: resolvedLeagueId,
  })
  const ageGroupLabel = resolveSeasonAgeGroupLabel({
    seasonKey,
    birthYear,
    ageGroupId: season?.ageGroupId,
    ageGroupLabel: season?.ageGroupLabel,
  })
  const teamName = resolveOptionTeamName({
    season,
    teamDoc,
  })
  const optionKey = [
    seasonKey,
    birthYear || '',
    resolvedLeagueId,
    target,
  ].join('|')

  return {
    optionKey,
    target,
    season,
    seasonId: identity.seasonId,
    seasonKey,
    birthYear,
    leagueId: resolvedLeagueId,
    leagueName,
    ageGroupLabel,
    teamName,
    primaryLabel: [
      teamName,
      birthYear ? `שנתון ${birthYear}` : '',
      seasonKey,
    ].filter(Boolean).join(' · '),
    secondaryLabel: [
      leagueName,
      ageGroupLabel && ageGroupLabel !== '-' ? ageGroupLabel : '',
    ].filter(Boolean).join(' · '),
  }
}

export const findTeamPageTableRow = ({ season, teamId }) => {
  const rows = Array.isArray(season?.tableRank) ? season.tableRank : []
  const key = cleanValue(teamId)

  return rows.find(row => {
    const identity = normalizeTeamIdentity({ team: row })
    return [
      identity.teamId,
      identity.birthTeamId,
      identity.teamDocumentId,
      identity.birthTeamDocumentId,
      identity.teamSlotId,
    ].includes(key)
  }) || null
}

const toLeagueDocuments = leagueDocumentsOrLeague => (
  (Array.isArray(leagueDocumentsOrLeague)
    ? leagueDocumentsOrLeague
    : [leagueDocumentsOrLeague]
  ).filter(Boolean)
)

export const buildTeamPageSeasonOptions = (leagueDocumentsOrLeague, teamDoc = {}, teamSeasons = [], teamId = '') => {
  const options = []
  const seen = new Set()
  const expectedBirthYear = resolveExpectedBirthYear({
    teamDoc,
    teamId,
  })

  const pushOption = option => {
    if (!option.optionKey || seen.has(option.optionKey)) return
    if (
      expectedBirthYear &&
      option.birthYear &&
      Number(option.birthYear) !== Number(expectedBirthYear)
    ) return

    seen.add(option.optionKey)
    options.push(option)
  }

  ;(Array.isArray(teamSeasons) ? teamSeasons : []).forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return
    pushOption(buildSeasonOption({
      season,
      target: cleanValue(season?.seasonStatus) === 'completed' ? 'history' : 'current',
      teamDoc,
    }))
  })

  const pushLeagueOption = ({ league, season, target }) => {
    if (!season?.seasonId && !season?.seasonKey) return
    if (!findTeamPageTableRow({ season, teamId })) return

    pushOption(buildSeasonOption({
      season,
      target,
      leagueId: cleanValue(league?.leagueId || league?.id),
      teamDoc,
    }))
  }

  toLeagueDocuments(leagueDocumentsOrLeague).forEach(league => {
    if (league?.current?.seasonId || league?.current?.seasonKey) {
      pushLeagueOption({
        league,
        season: league.current,
        target: 'current',
      })
    }

    const history = Array.isArray(league?.history) ? league.history : []
    history.forEach(season => {
      pushLeagueOption({
        league,
        season,
        target: 'history',
      })
    })
  })

  const hasFutureSeason = options.some(option => (
    option.seasonKey === TEAM_PAGE_FUTURE_SEASON_KEY
  ))

  if (expectedBirthYear && !hasFutureSeason) {
    const routeLeagueId = cleanValue(
      toLeagueDocuments(leagueDocumentsOrLeague)[0]?.leagueId ||
      toLeagueDocuments(leagueDocumentsOrLeague)[0]?.id
    )
    const latestKnownOption = [...options]
      .filter(option => option.seasonKey !== TEAM_PAGE_FUTURE_SEASON_KEY)
      .sort((left, right) => (
        resolveSeasonSortValue(right.seasonKey) - resolveSeasonSortValue(left.seasonKey)
      ))[0]
    const fallbackLeagueId = cleanValue(latestKnownOption?.leagueId || routeLeagueId)

    pushOption(buildSeasonOption({
      season: {
        seasonId: TEAM_PAGE_FUTURE_SEASON_KEY,
        seasonKey: TEAM_PAGE_FUTURE_SEASON_KEY,
        birthYear: expectedBirthYear,
        leagueId: fallbackLeagueId,
        leagueName: latestKnownOption?.leagueName || 'ליגה טרם הוגדרה',
        ageGroupId: latestKnownOption?.season?.ageGroupId || '',
        ageGroupLabel: latestKnownOption?.ageGroupLabel || '',
      },
      target: 'future',
      leagueId: fallbackLeagueId,
      teamDoc,
    }))
  }

  return options
    .filter(option => option.seasonKey || option.seasonId)
    .sort((left, right) => {
      const seasonOrder = resolveSeasonSortValue(right.seasonKey) - resolveSeasonSortValue(left.seasonKey)
      if (seasonOrder) return seasonOrder

      return Number(right.birthYear || 0) - Number(left.birthYear || 0)
    })
}


export const findTeamPageSeasonDoc = ({ teamSeasons = [], selectedSeasonOption }) => {
  if (!selectedSeasonOption) return null

  const rows = Array.isArray(teamSeasons) ? teamSeasons : []
  return rows.find(row => isSameSeason(row, selectedSeasonOption)) || null
}

export const findTeamPageLeagueSeasonDoc = ({
  leagueDoc,
  leagueDocuments,
  selectedSeasonOption,
}) => {
  if (!selectedSeasonOption) return null

  const documents = toLeagueDocuments(
    leagueDocuments?.length ? leagueDocuments : leagueDoc
  ).sort((left, right) => (
    Number(cleanValue(right?.id || right?.leagueId) === cleanValue(selectedSeasonOption?.leagueId)) -
    Number(cleanValue(left?.id || left?.leagueId) === cleanValue(selectedSeasonOption?.leagueId))
  ))

  for (const document of documents) {
    const current = document?.current
    if (
      current &&
      typeof current === 'object' &&
      isSameSeason(current, selectedSeasonOption)
    ) {
      return {
        leagueDoc: document,
        season: current,
        target: 'current',
      }
    }

    const history = Array.isArray(document?.history) ? document.history : []
    const historySeason = history.find(row => isSameSeason(row, selectedSeasonOption))
    if (historySeason) {
      return {
        leagueDoc: document,
        season: historySeason,
        target: 'history',
      }
    }
  }

  return null
}
