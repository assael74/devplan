// src/features/playersDatabase/services/audit/repair/repairLeagueFinding.js

import { buildTeamSeasonDocumentId, requireSeasonId } from '../../../domain/identity/index.js'
import { requireLeagueId } from '../../../domain/league/leagueIdentity.js'
import {
  buildLeagueLoadProjectionRepairPlan,
  buildLeagueSeasonDeleteWritePlan,
  buildLeaguesCenterIdentity,
  buildLeaguesCenterSeason,
} from '../../../domain/league/leagueWritePlan.builder.js'
import { readLeagueMutationSources } from '../../write/league/readLeagueWriteSources.js'
import { writeClubsCenter } from '../../write/league/writeClubsCenter.js'
import { writeLeaguesCenter } from '../../write/league/writeLeaguesCenter.js'
import { writeTeamSeasonCompetitionSnapshots } from '../../write/league/writeTeamSeasonCompetitionSnapshots.js'
import { readClubProfiles } from '../league/readActual.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const writersByTarget = {
  leaguesCenter: writeLeaguesCenter,
  clubsCenter: writeClubsCenter,
  teamSeasonCompetitionSnapshots: writeTeamSeasonCompetitionSnapshots,
}

const indexTeamSeasons = ({ sources, leagueId, seasonId }) => {
  const result = new Map()

  ;(sources.existingTeamSeasons || []).forEach(teamSeason => {
    const identity = object(teamSeason.identity)
    const teamId = clean(identity.teamId)
    const expectedId = teamId ? buildTeamSeasonDocumentId({ teamId, seasonId }) : ''
    if (
      !teamId
      || clean(identity.leagueId) !== leagueId
      || clean(identity.seasonId) !== seasonId
      || clean(teamSeason.id) !== expectedId
      || result.has(teamId)
    ) {
      throw new Error('זהות עונת קבוצה אינה תקינה; לא ניתן לבנות את התוצר בבטחה')
    }
    result.set(teamId, teamSeason)
  })

  return result
}

const requireSingleLeagueOwner = ({ teamIds, sources }) => {
  const otherOwners = object(sources.otherLeagueIdsByTeamId)
  if (teamIds.some(teamId => Array.isArray(otherOwners[teamId]) && otherOwners[teamId].length > 0)) {
    throw new Error('לקבוצה יש בעלות קנונית בליגה נוספת; יש להסדיר את השיוך לפני תיקון התוצר')
  }
}

const buildLeaguesCenterRepair = ({
  leagueId,
  seasonId,
  league,
  season,
  teamSeasonsByTeamId,
  updatedAt,
}) => ({
  leaguesCenterProjection: {
    writeRequired: true,
    operation: 'UPSERT_SEASON',
    leagueId,
    seasonId,
    identity: buildLeaguesCenterIdentity(league),
    season: buildLeaguesCenterSeason({
      season,
      teamSeasonsByTeamId,
      previousLeaguesCenterTeamsById: {},
      updatedAt,
    }),
    updatedAt,
  },
})

const readRequiredProfiles = async rows => {
  const clubIds = Array.from(new Set(rows.map(row => clean(row.clubId)).filter(Boolean)))
  const profiles = await readClubProfiles({ clubIds })
  if (rows.some(row => !clean(row.clubId) || !profiles[clean(row.clubId)])) {
    throw new Error('חסר פרופיל מועדון קנוני; תיקון התוצר אינו יוצר פרופילי מועדון')
  }
  return profiles
}

const narrowSnapshotRepair = ({ approvedState, documentId }) => {
  const targets = (approvedState.teamSeasonCompetitionSnapshots || [])
    .filter(item => item.teamSeasonDocumentId === documentId)
  if (targets.length !== 1) {
    throw new Error('עונת הקבוצה הקנונית חסרה או אינה שייכת ליעד; לא ניתן לתקן את תמונת התחרות')
  }
  return { seasonId: approvedState.seasonId, teamSeasonCompetitionSnapshots: targets }
}

export const repairLeagueFinding = async ({ scope = {}, finding = {} } = {}) => {
  const target = clean(finding.target)
  const writer = Object.prototype.hasOwnProperty.call(writersByTarget, target)
    ? writersByTarget[target]
    : null
  if (typeof writer !== 'function') throw new Error('אין תיקון עצמאי ליעד בדיקת הליגה הזה')

  const leagueId = requireLeagueId(scope.leagueId)
  const seasonId = requireSeasonId(scope.seasonId)
  const sources = await readLeagueMutationSources({ leagueId, seasonId })
  const league = sources.existingLeague
  if (league && clean(league.leagueId) !== leagueId) {
    throw new Error('זהות הליגה הקנונית אינה תואמת ליעד התיקון')
  }
  const season = object(object(league).seasonsById)[seasonId] || null
  const updatedAt = season
    ? season.updatedAt || null
    : object(object(league).timestamps).updatedAt || null
  const teamSeasonsByTeamId = indexTeamSeasons({ sources, leagueId, seasonId })
  const documentId = clean(finding.documentId)
  const isSnapshot = target === 'teamSeasonCompetitionSnapshots'
  const selectedTeamSeason = isSnapshot
    ? Array.from(teamSeasonsByTeamId.values()).find(item => item.id === documentId)
    : null

  if (isSnapshot && !selectedTeamSeason) {
    throw new Error('עונת הקבוצה הקנונית חסרה; תיקון תמונת התחרות אינו יוצר עונת קבוצה')
  }

  const teamsById = object(season && season.table && season.table.teamsById)
  const selectedTeamId = selectedTeamSeason ? clean(selectedTeamSeason.identity.teamId) : ''
  if (target !== 'leaguesCenter') {
    requireSingleLeagueOwner({
      teamIds: isSnapshot ? [selectedTeamId] : Object.keys(teamsById),
      sources,
    })
  }

  let approvedState
  if (!season || (isSnapshot && !teamsById[selectedTeamId])) {
    // Reuse only the projection plan; canonical deletion is never executed here.
    approvedState = buildLeagueSeasonDeleteWritePlan({
      ...sources,
      leagueId,
      seasonId,
      updatedAt,
    })
  } else if (target === 'leaguesCenter') {
    approvedState = buildLeaguesCenterRepair({
      leagueId,
      seasonId,
      league,
      season,
      teamSeasonsByTeamId,
      updatedAt,
    })
  } else {
    const rows = Object.values(teamsById)
    const clubProfilesById = await readRequiredProfiles(rows)
    approvedState = buildLeagueLoadProjectionRepairPlan({
      ...sources,
      leagueId,
      seasonId,
      clubProfilesById,
      updatedAt,
    })
  }

  const writeState = isSnapshot
    ? narrowSnapshotRepair({ approvedState, documentId })
    : approvedState
  return writer({ approvedState: writeState })
}
