import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import {
  trackedRunTransaction,
} from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildClubDocumentProjection,
  removeClubAgeGroupSeasonProjections,
} from '../../../../domain/projections/club/index.js'
import {
  buildLeagueClubCleanupRemovals,
  buildLeagueClubRowProjection,
} from '../../../../domain/projections/club/leagueClubSync.projection.js'
import {
  buildTeamSeasonDocumentId,
} from '../../../../model/team/teamIdentity.model.js'
import { cleanValue } from '../../../../model/shared/value.model.js'
import { buildLeagueTeamSeasons } from '../../../../domain/orchestration/buildLeagueTeamSeasons.js'

const clean = cleanValue

export async function syncLeagueClubsV2({
  league = {},
  season = {},
  rows = [],
  target = 'current',
  leagueSeasonDocument = {},
  removedLeagueEntries = [],
} = {}) {
  const leagueId = clean(league.id || league.leagueId || season.leagueId)
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const ageGroupId = clean(league.ageGroupId || season.ageGroupId)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonKey) throw new Error('Missing season key')
  if (!ageGroupId) throw new Error('Missing age group id')
  if (!Array.isArray(rows)) throw new Error('League rows must be an array')

  const leagueTeamSeasons = buildLeagueTeamSeasons({
    leagueDocument: { ...league, id: leagueId },
    seasonDocument: {
      ...season,
      ...leagueSeasonDocument,
      tableRank: rows,
    },
    target: clean(target) === 'history' ? 'history' : 'current',
  })
  const scoutPerformanceByTeamId = new Map(leagueTeamSeasons.map(item => [
    clean(item?.identity?.teamId || item?.identity?.teamDocumentId),
    item?.performance || null,
  ]))
  const projectionRows = rows.map(row => {
    const teamId = clean(row?.teamId || row?.birthTeamId)
    const performance = scoutPerformanceByTeamId.get(teamId) || null
    return {
      ...row,
      teamAttackPerformance: performance?.offense || null,
      teamDefensePerformance: performance?.defense || null,
    }
  })

  const currentClubIds = rows.map(row => clean(row?.clubId)).filter(Boolean)
  const removedClubIds = (Array.isArray(removedLeagueEntries) ? removedLeagueEntries : [])
    .map(entry => clean(entry?.clubId))
    .filter(Boolean)
  const affectedClubIds = [...new Set([...currentClubIds, ...removedClubIds])]
  const rowTargets = projectionRows.map(row => {
    const teamId = clean(row?.teamId || row?.birthTeamId)
    const teamSeasonDocumentId = buildTeamSeasonDocumentId(teamId, seasonKey)

    return {
      row,
      teamId,
      teamSeasonDocumentId,
      teamSeasonRef: teamSeasonDocumentId
        ? doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId)
        : null,
    }
  })

  const clubResult = await trackedRunTransaction(db, async transaction => {
    const clubSnapshots = new Map()
    const teamSeasonSnapshots = new Map()

    for (const clubId of affectedClubIds) {
      clubSnapshots.set(
        clubId,
        await transaction.get(doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, clubId))
      )
    }
    for (const target of rowTargets) {
      if (!target.teamSeasonRef || teamSeasonSnapshots.has(target.teamSeasonDocumentId)) continue
      teamSeasonSnapshots.set(
        target.teamSeasonDocumentId,
        await transaction.get(target.teamSeasonRef)
      )
    }

    const nextClubs = new Map()
    affectedClubIds.forEach(clubId => {
      const snapshot = clubSnapshots.get(clubId)
      nextClubs.set(clubId, snapshot?.exists() ? snapshot.data() || {} : {})
    })

    let removedProjectionCount = 0
    affectedClubIds.forEach(clubId => {
      const existingClub = nextClubs.get(clubId) || {}
      const removals = buildLeagueClubCleanupRemovals({
        club: existingClub,
        clubId,
        league,
        season,
        rows: projectionRows,
        removedLeagueEntries,
      })
      if (!removals.length) return

      nextClubs.set(clubId, removeClubAgeGroupSeasonProjections({
        existingClub,
        removals,
      }))
      removedProjectionCount += removals.length
    })

    let projectedRows = 0
    for (const target of rowTargets) {
      const clubId = clean(target.row?.clubId)
      if (!clubId || !target.teamId) {
        throw new Error('Missing club id or team id for Club projection')
      }

      const teamSeasonSnapshot = target.teamSeasonDocumentId
        ? teamSeasonSnapshots.get(target.teamSeasonDocumentId)
        : null
      const teamSeason = teamSeasonSnapshot?.exists()
        ? teamSeasonSnapshot.data() || {}
        : {}
      const projection = buildLeagueClubRowProjection({
        league,
        season,
        rows: projectionRows,
        row: target.row,
        teamSeason,
        leagueSeasonDocument,
      })
      if (!projection.clubIdentity?.clubId) {
        throw new Error('Missing club identity for Club projection')
      }

      let nextClub = buildClubDocumentProjection({
        existingClub: nextClubs.get(clubId) || {},
        clubIdentity: projection.clubIdentity,
        ageGroupSeasonProjection: projection.ageGroupSeasonProjection,
        competitionPathUpdate: projection.competitionPathUpdate.birthYear
          ? projection.competitionPathUpdate
          : null,
        projectionVersion: 1,
      })
      nextClubs.set(clubId, nextClub)
      projectedRows += 1
    }

    let changedClubs = 0
    for (const clubId of affectedClubIds) {
      const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, clubId)
      const snapshot = clubSnapshots.get(clubId)
      const existing = snapshot?.exists() ? snapshot.data() || {} : {}
      const next = nextClubs.get(clubId) || {}
      const changed = !snapshot?.exists() || JSON.stringify(existing) !== JSON.stringify(next)

      if (!changed) continue
      transaction.set(reference, {
        ...next,
        clubId,
        projectionVersion: 1,
        createdAt: existing.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      changedClubs += 1
    }

    return {
      affectedClubs: affectedClubIds.length,
      changedClubs,
      projectedRows,
      removedProjectionCount,
    }
  }, {
    feature: 'playersDatabase',
    action: 'league-v2-sync-clubs',
    collection: PLAYERS_DATABASE_COLLECTIONS.clubs,
  })

  return {
    leagueId,
    seasonKey,
    ...clubResult,
  }
}

