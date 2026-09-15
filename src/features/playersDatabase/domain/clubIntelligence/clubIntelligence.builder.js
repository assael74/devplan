import {
  CLUB_INTELLIGENCE_AVAILABILITY,
  CLUB_INTELLIGENCE_EMPTY_AVAILABILITY,
  CLUB_INTELLIGENCE_SEASON_VIEW,
  isClubIntelligenceAvailability,
} from './clubIntelligence.contract.js'
import { buildClubSpotlights } from './clubSpotlights.builder.js'
import {
  CLUB_COMPETITION_PROJECTION_SOURCE,
  CLUB_COMPETITION_STATUS,
  normalizeClubCompetitionProjectionSource,
  normalizeClubCompetitionStatus,
} from '../contracts/club.contract.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const toNumberOrNull = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toPositiveNumberOrNull = value => {
  const number = toNumberOrNull(value)
  return number && number > 0 ? number : null
}

const normalizeAvailability = ({ availability, reason } = {}) => {
  const normalizedAvailability = clean(availability).toLowerCase()

  return {
    availability: isClubIntelligenceAvailability(normalizedAvailability)
      ? normalizedAvailability
      : CLUB_INTELLIGENCE_EMPTY_AVAILABILITY.availability,
    reason: clean(reason) || null,
  }
}

const hasExplicitBoolean = value => typeof value === 'boolean'

const mergeTeamTaskSignals = ({
  masterSignals = {},
  clubDocumentSignals = {},
} = {}) => ['offense', 'defense'].reduce((signals, key) => {
  const masterValue = masterSignals?.[key]
  const clubDocumentValue = clubDocumentSignals?.[key]

  if (hasExplicitBoolean(masterValue)) {
    signals[key] = masterValue
  } else if (hasExplicitBoolean(clubDocumentValue)) {
    signals[key] = clubDocumentValue
  }

  return signals
}, {})

const hasKnownCompetitionStatus = value => (
  Object.values(CLUB_COMPETITION_STATUS).includes(clean(value).toUpperCase())
)

const hasKnownCompetitionSource = value => (
  Object.values(CLUB_COMPETITION_PROJECTION_SOURCE).includes(
    clean(value).toUpperCase()
  )
)

const preferPositiveCompetitionValue = ({
  masterValue,
  clubDocumentValue,
} = {}) => (
  toPositiveNumberOrNull(clubDocumentValue) ||
  toPositiveNumberOrNull(masterValue)
)

const isUnavailableCompetitionReason = reason => {
  const normalizedReason = clean(reason).toUpperCase()

  return normalizedReason.startsWith('SOURCE_') ||
    normalizedReason.startsWith('PROJECTION_')
}

export const normalizeCompetitionAvailability = ({
  status,
  reason,
} = {}) => {
  const normalizedStatus = normalizeClubCompetitionStatus(
    status,
    CLUB_COMPETITION_STATUS.UNKNOWN
  )
  const normalizedReason = clean(reason) || null

  if (normalizedStatus !== 'UNKNOWN') {
    return {
      availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE,
      reason: normalizedReason,
    }
  }

  if (isUnavailableCompetitionReason(normalizedReason)) {
    return {
      availability: CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE,
      reason: normalizedReason,
    }
  }

  return {
    availability: CLUB_INTELLIGENCE_AVAILABILITY.UNKNOWN,
    reason: normalizedReason,
  }
}

const normalizeCompetition = ({
  masterCompetition = {},
  clubDocumentPath = null,
} = {}) => {
  const clubDocumentNextPath = clubDocumentPath?.nextCompetitionPath || null
  const masterStatus = masterCompetition?.status
  const clubDocumentStatus = clubDocumentNextPath?.status
  const masterSource = masterCompetition?.source
  const clubDocumentSource = clubDocumentNextPath?.source
  const status = normalizeClubCompetitionStatus(
    hasKnownCompetitionStatus(clubDocumentStatus)
      ? clubDocumentStatus
      : masterStatus,
    CLUB_COMPETITION_STATUS.UNKNOWN
  )
  const reason = clean(clubDocumentNextPath?.reason) ||
    clean(masterCompetition?.reason) || null

  return {
    sourceBirthYear: preferPositiveCompetitionValue({
      masterValue: masterCompetition?.sourceBirthYear,
      clubDocumentValue: clubDocumentNextPath?.sourceBirthYear,
    }),
    currentLeagueLevel: toPositiveNumberOrNull(
      masterCompetition?.currentLeagueLevel
    ),
    projectedNextLeagueLevel: preferPositiveCompetitionValue({
      masterValue: masterCompetition?.projectedNextLeagueLevel,
      clubDocumentValue: clubDocumentNextPath?.projectedNextLeagueLevel,
    }),
    status,
    source: normalizeClubCompetitionProjectionSource(
      hasKnownCompetitionSource(clubDocumentSource)
        ? clubDocumentSource
        : masterSource,
      CLUB_COMPETITION_PROJECTION_SOURCE.AUTOMATIC
    ),
    reason,
    availability: normalizeCompetitionAvailability({ status, reason }),
  }
}

const buildTeamSource = ({ team = {}, ageGroup = {} } = {}) => ({
  ...team,
  ageGroupId: clean(team?.ageGroupId || ageGroup?.ageGroupId),
  ageGroupLabel: clean(team?.ageGroupLabel || ageGroup?.ageGroupLabel),
  teamTaskAvailability: normalizeAvailability({
    availability: team?.teamTaskAvailability?.availability,
    reason: team?.teamTaskAvailability?.reason,
  }),
})

const buildSeasonBucket = () => ({
  teams: [],
})

const buildBirthYearTeam = birthYear => ({
  birthYear,
  seasons: {
    [CLUB_INTELLIGENCE_SEASON_VIEW.CURRENT]: buildSeasonBucket(),
    [CLUB_INTELLIGENCE_SEASON_VIEW.PREVIOUS]: buildSeasonBucket(),
  },
  league: {
    current: [],
    previous: [],
  },
  performance: {
    current: [],
    previous: [],
  },
  squad: {
    current: [],
    previous: [],
  },
  profiles: {
    current: [],
    previous: [],
  },
  transfers: {
    current: [],
    previous: [],
  },
  competition: {
    sourceBirthYear: null,
    currentLeagueLevel: null,
    projectedNextLeagueLevel: null,
    status: 'UNKNOWN',
    source: 'AUTOMATIC',
    reason: null,
    availability: { ...CLUB_INTELLIGENCE_EMPTY_AVAILABILITY },
  },
})

const populateTeamContext = ({ birthYearTeam, seasonView, team }) => {
  birthYearTeam.seasons[seasonView].teams.push(team)
  birthYearTeam.league[seasonView].push(team?.league || {})
  birthYearTeam.performance[seasonView].push(team?.performance || {})
  birthYearTeam.squad[seasonView].push({
    playersCount: toNumberOrNull(team?.playersCount),
    teamTaskSignals: team?.teamTaskSignals || {},
    teamTaskAvailability: team?.teamTaskAvailability || null,
    lineStructure: team?.lineStructure || null,
  })
  birthYearTeam.profiles[seasonView].push(team?.scoutProfilesSummary || {})
  birthYearTeam.transfers[seasonView].push(team?.transfers || null)
}

const buildMasterBirthYearTeams = ({ club = {} } = {}) => {
  const byBirthYear = new Map()
  const ensureBirthYearTeam = birthYear => {
    if (!birthYear) return null
    if (!byBirthYear.has(birthYear)) {
      byBirthYear.set(birthYear, buildBirthYearTeam(birthYear))
    }
    return byBirthYear.get(birthYear)
  }

  ;(Array.isArray(club?.ageGroups) ? club.ageGroups : []).forEach(ageGroup => {
    Object.values(CLUB_INTELLIGENCE_SEASON_VIEW).forEach(seasonView => {
      const teams = Array.isArray(ageGroup?.[seasonView]) ? ageGroup[seasonView] : []
      teams.forEach(sourceTeam => {
        const team = buildTeamSource({ team: sourceTeam, ageGroup })
        const birthYear = toPositiveNumberOrNull(team?.birthYear)
        const birthYearTeam = ensureBirthYearTeam(birthYear)
        if (birthYearTeam) populateTeamContext({ birthYearTeam, seasonView, team })
      })
    })
  })

  ;(Array.isArray(club?.competitionPaths) ? club.competitionPaths : []).forEach(path => {
    const birthYear = toPositiveNumberOrNull(path?.birthYear)
    const birthYearTeam = ensureBirthYearTeam(birthYear)
    if (!birthYearTeam) return

    birthYearTeam.competition = normalizeCompetition({
      masterCompetition: path,
    })
  })

  return [...byBirthYear.values()].sort((left, right) => right.birthYear - left.birthYear)
}

const buildClubIdentity = club => ({
  clubId: clean(club?.clubId),
  externalClubId: clean(club?.externalClubId),
  name: clean(club?.name),
  shortName: clean(club?.shortName),
  clubUrl: clean(club?.clubUrl),
  clubLevel: toPositiveNumberOrNull(club?.clubLevel),
  clubStrengthLevel: toPositiveNumberOrNull(club?.clubStrengthLevel),
})

const buildSeasonView = ({ club = {}, seasonView } = {}) => ({
  ageGroups: (Array.isArray(club?.ageGroups) ? club.ageGroups : []).map(ageGroup => ({
    ageGroupId: clean(ageGroup?.ageGroupId),
    ageGroupLabel: clean(ageGroup?.ageGroupLabel),
    teams: Array.isArray(ageGroup?.[seasonView]) ? ageGroup[seasonView] : [],
  })),
})

export const buildClubIntelligenceFromMaster = ({ club = {} } = {}) => {
  const birthYearTeams = buildMasterBirthYearTeams({ club })
  const intelligence = {
    club: buildClubIdentity(club),
    seasons: {
      current: buildSeasonView({
        club,
        seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.CURRENT,
      }),
      previous: buildSeasonView({
        club,
        seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.PREVIOUS,
      }),
    },
    birthYearTeams,
    spotlights: [],
  }

  return {
    ...intelligence,
    spotlights: buildClubSpotlights({
      club: intelligence.club,
      birthYearTeams,
    }),
  }
}

const findClubSeason = ({ club = {}, team = {} } = {}) => (
  (Array.isArray(club?.ageGroups) ? club.ageGroups : []).flatMap(ageGroup => (
    (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []).map(season => ({
      ...season,
      ageGroupId: clean(ageGroup?.ageGroupId),
      ageGroupLabel: clean(ageGroup?.ageGroupLabel),
    }))
  )).find(season => (
    clean(season?.teamId) === clean(team?.teamId) &&
    clean(season?.seasonKey || season?.seasonId) === clean(team?.seasonKey || team?.seasonId)
  )) || null
)

const enrichTeamFromClubDocument = ({ team = {}, clubDocument = {} } = {}) => {
  const clubDocumentSeason = findClubSeason({
    club: clubDocument,
    team,
  })
  const masterAvailability = normalizeAvailability({
    availability: team?.teamTaskAvailability?.availability,
    reason: team?.teamTaskAvailability?.reason,
  })
  const clubAvailability = normalizeAvailability({
    availability: clubDocumentSeason?.teamTaskAvailability?.availability,
    reason: clubDocumentSeason?.teamTaskAvailability?.reason,
  })
  const useClubAvailability = (
    masterAvailability.availability === CLUB_INTELLIGENCE_AVAILABILITY.UNKNOWN &&
    clubAvailability.availability !== CLUB_INTELLIGENCE_AVAILABILITY.UNKNOWN
  )

  return {
    ...team,
    teamTaskSignals: mergeTeamTaskSignals({
      masterSignals: team?.teamTaskSignals,
      clubDocumentSignals: clubDocumentSeason?.teamTaskSignals,
    }),
    teamTaskAvailability: useClubAvailability ? clubAvailability : masterAvailability,
  }
}

export const enrichClubIntelligenceFromClubDocument = ({
  intelligence = {},
  clubDocument = {},
} = {}) => {
  const competitionPathsByBirthYear = new Map(
    (Array.isArray(clubDocument?.competitionPaths) ? clubDocument.competitionPaths : [])
      .map(path => [toPositiveNumberOrNull(path?.birthYear), path])
      .filter(([birthYear]) => Boolean(birthYear))
  )
  const enrichedBirthYearTeams = (Array.isArray(intelligence?.birthYearTeams)
    ? intelligence.birthYearTeams
    : []).map(birthYearTeam => ({
    ...birthYearTeam,
    seasons: Object.fromEntries(Object.values(CLUB_INTELLIGENCE_SEASON_VIEW).map(seasonView => {
      const teams = Array.isArray(birthYearTeam?.seasons?.[seasonView]?.teams)
        ? birthYearTeam.seasons[seasonView].teams
        : []
      return [seasonView, {
        teams: teams.map(team => enrichTeamFromClubDocument({
          team,
          clubDocument,
        })),
      }]
    })),
    competition: normalizeCompetition({
      masterCompetition: birthYearTeam.competition,
      clubDocumentPath: competitionPathsByBirthYear.get(birthYearTeam.birthYear) || null,
    }),
  }))

  const enriched = {
    ...intelligence,
    club: {
      ...intelligence.club,
      ...buildClubIdentity({
        ...intelligence.club,
        ...clubDocument,
      }),
    },
    birthYearTeams: enrichedBirthYearTeams,
  }

  return {
    ...enriched,
    spotlights: buildClubSpotlights({
      club: enriched.club,
      birthYearTeams: enrichedBirthYearTeams,
    }),
  }
}
