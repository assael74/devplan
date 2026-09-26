// src/features/playersDatabase/services/writeV2/stats/flows/writeStatsCanonical.flow.js

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { applyApprovedStatsTeamSeason } from '../support/applyApprovedStatsTeamSeason.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const requireApprovedStatsState = approvedState => {
  if (!approvedState || typeof approvedState !== 'object' || Array.isArray(approvedState)) {
    const error = new Error('Approved Stats State is required')
    error.code = 'STATS_APPROVED_STATE_REQUIRED'
    throw error
  }

  if (clean(approvedState.planType) !== 'approvedStatsState' ||
      Number(approvedState.planVersion) !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Unsupported Approved Stats State contract')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }

  if (!approvedState.teamSeason || typeof approvedState.teamSeason !== 'object') {
    const error = new Error('Approved Team Season state is required')
    error.code = 'STATS_APPROVED_TEAM_SEASON_REQUIRED'
    throw error
  }

  return approvedState
}

const sameValue = (left, right) => JSON.stringify(left) === JSON.stringify(right)

export async function writeStatsCanonicalV2({ approvedState } = {}) {
  const approved = requireApprovedStatsState(approvedState)
  const birthTeamDocumentId = clean(approved.identity?.birthTeamDocumentId)
  const seasonKey = clean(approved.identity?.seasonKey)
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(birthTeamDocumentId, seasonKey)

  if (!birthTeamDocumentId || !seasonKey || !teamSeasonDocumentId) {
    const error = new Error('Approved Stats identity is incomplete')
    error.code = 'STATS_APPROVED_IDENTITY_INVALID'
    throw error
  }

  const rootRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.teams, birthTeamDocumentId)
  const seasonRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId)
  const rootSnapshot = await getDoc(rootRef)

  if (!rootSnapshot.exists()) {
    const error = new Error('Canonical Team Root does not exist')
    error.code = 'STATS_TEAM_ROOT_NOT_FOUND'
    throw error
  }

  const seasonSnapshot = await getDoc(seasonRef)

  if (!seasonSnapshot.exists()) {
    const error = new Error('Canonical Team Season does not exist')
    error.code = 'STATS_TEAM_SEASON_NOT_FOUND'
    throw error
  }

  const currentSeason = seasonSnapshot.data() || {}
  const nextSeason = applyApprovedStatsTeamSeason({
    currentSeason,
    approvedTeamSeason: approved.teamSeason,
  })
  const writeSkipped = sameValue(currentSeason, nextSeason)

  if (!writeSkipped) {
    await setDoc(seasonRef, {
      ...nextSeason,
      updatedAt: serverTimestamp(),
    })
  }

  return {
    birthTeamDocumentId,
    teamSeasonDocumentId,
    seasonKey,
    playersCount: approved.teamSeason.playersCount,
    writeSkipped,
  }
}
