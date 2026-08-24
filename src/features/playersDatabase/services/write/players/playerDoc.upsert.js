// src/features/playersDatabase/services/write/players/playerDoc.upsert.js

import { db } from '../../../../../services/firebase/firebase.js'
import { getTeamById } from '../../read/team.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import {
  buildPlayerBaseDoc,
  buildPlayerDocumentId,
  playerDocRef,
} from './playerDoc.model.js'
import {
  buildPlayerSeasonDoc,
  buildPlayerSeasonRowsFromTeamDoc,
  findPlayerSeasonRowIndex,
  removePlayerSeasonRow,
} from './playerSeason.model.js'
import {
  buildScoutingPlayerReasonEvents,
  buildScoutingPlayerTracking,
  mergeScoutingPlayerEvents,
  SCOUTING_PLAYER_EVENT_TYPES,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from './scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from './scoutingPlayerVerification.model.js'
import { buildPlayerScoutStatsLoadMeasurementHistory } from '../../../model/playerScoutMeasurement.model.js'
import { buildPlayerScoutState } from '../../../domain/orchestration/buildPlayerScoutState.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

const buildCreatedEvent = ({ season = {}, team = {}, trackedAt = '' } = {}) => ({
  eventKey: [
    SCOUTING_PLAYER_EVENT_TYPES.PLAYER_DOCUMENT_CREATED,
    clean(season.seasonKey || season.seasonId),
    clean(team.clubId),
    clean(team.birthTeamId || team.teamId),
  ].filter(Boolean).join('__'),
  type: SCOUTING_PLAYER_EVENT_TYPES.PLAYER_DOCUMENT_CREATED,
  seasonId: clean(season.seasonId),
  seasonKey: clean(season.seasonKey),
  clubId: clean(team.clubId),
  birthTeamId: clean(team.birthTeamId || team.teamId),
  detectedAt: trackedAt || null,
})

const normalizeComparableValue = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue)
  }

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  return value
}

const stripPlayerDocTechnicalTimestamps = value => {
  if (!value || typeof value !== 'object') return value

  const next = {
    ...value,
  }

  delete next.updatedAt

  next.current = (Array.isArray(value.current) ? value.current : []).map(row => {
    const nextRow = {
      ...row,
    }
    delete nextRow.updatedAt
    return nextRow
  })

  next.history = (Array.isArray(value.history) ? value.history : []).map(row => {
    const nextRow = {
      ...row,
    }
    delete nextRow.updatedAt
    return nextRow
  })

  return next
}

const isPlayerDocStateUnchanged = ({
  currentData = {},
  nextData = {},
} = {}) => (
  JSON.stringify(
    normalizeComparableValue(
      stripPlayerDocTechnicalTimestamps(currentData)
    )
  ) ===
  JSON.stringify(
    normalizeComparableValue(
      stripPlayerDocTechnicalTimestamps(nextData)
    )
  )
)
export const upsertProfiledPlayerDoc = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
  teamDocument = null,
} = {}) => {
  const playerDocumentId = buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) return {
    skipped: true,
    reason: 'missingPlayerDocumentId',
  }
  if (!seasonId) throw new Error('Missing season id')

  const ref = playerDocRef(playerDocumentId)
  const teamDocumentId = clean(
    team.birthTeamDocumentId ||
    team.birthTeamId ||
    team.teamDocumentId ||
    team.teamId
  )
  const teamDoc = teamDocument || (
    teamDocumentId ? await getTeamById(teamDocumentId) : null
  )
  const resolvedTeam = teamDoc ? {
    ...teamDoc,
    ...team,
  } : team

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const verification = normalizeScoutingPlayerVerification(
      currentData.verification
    )
    const baseDoc = buildPlayerBaseDoc(
      {
        ...player,
        playerDocumentId,
      },
      currentData,
      season,
      resolvedTeam
    )
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const seasonStatus = isHistory || clean(season.seasonStatus) === 'completed'
      ? 'completed'
      : 'active'
    const seasonScope = {
      ...season,
      seasonId,
      seasonKey,
      seasonStatus,
    }
    const initialSeasonDoc = buildPlayerSeasonDoc({
      season: seasonScope,
      team: resolvedTeam,
      player,
    })

    const shouldHydrateFromTeamDoc = !snapshot.exists() && teamDoc
    const hydratedRows = shouldHydrateFromTeamDoc
      ? buildPlayerSeasonRowsFromTeamDoc({
          teamDoc,
          season: seasonScope,
          team: resolvedTeam,
          player,
          target: isHistory ? 'history' : 'current',
        })
      : {
          current: [],
          history: [],
        }

    const sourceCurrentRows = snapshot.exists()
      ? baseDoc.current
      : hydratedRows.current
    const sourceHistoryRows = snapshot.exists()
      ? baseDoc.history
      : hydratedRows.history
    const sourceSeasonRows = isHistory ? sourceHistoryRows : sourceCurrentRows
    const sourceSeasonIndex = findPlayerSeasonRowIndex({
      rows: sourceSeasonRows,
      season: seasonScope,
      team: resolvedTeam,
    })
    const sourceSeasonRow = sourceSeasonIndex >= 0
      ? sourceSeasonRows[sourceSeasonIndex]
      : null
    const currentWithoutSeason = removePlayerSeasonRow({
      rows: sourceCurrentRows,
      season: seasonScope,
      team: resolvedTeam,
    })
    const historyWithoutSeason = removePlayerSeasonRow({
      rows: sourceHistoryRows,
      season: seasonScope,
      team: resolvedTeam,
    })
    const playerSeasonStints = [
      ...historyWithoutSeason,
      ...currentWithoutSeason,
      initialSeasonDoc,
    ]
    const scoutedPlayer = buildPlayerScoutState({
      player: {
        ...player,
        playerSeasonStints,
        playerReview: currentData.playerReview || player.playerReview || null,
        manualImmediacyDecision:
          currentData.manualImmediacyDecision ||
          player.manualImmediacyDecision ||
          null,
        verification,
        verificationAnswers: verification.answers,
      },
      team: resolvedTeam,
      season: seasonScope,
      verificationAnswers: verification.answers,
      manualReview: currentData.playerReview || player.playerReview || null,
      manualImmediacyDecision:
        currentData.manualImmediacyDecision ||
        player.manualImmediacyDecision ||
        null,
    })
    const scoutStatsLoadMeasurementHistory = buildPlayerScoutStatsLoadMeasurementHistory({
      existingHistory: sourceSeasonRow?.scoutStatsLoadMeasurementHistory,
      measurements: player.scoutStatsLoadMeasurements,
    })
    const seasonDoc = buildPlayerSeasonDoc({
      season: seasonScope,
      team: resolvedTeam,
      player: {
        ...scoutedPlayer,
        scoutStatsLoadMeasurementHistory,
      },
    })

    const trackedAt = new Date().toISOString()
    const tracking = buildScoutingPlayerTracking({
      currentTracking: {
        ...(player.tracking || {}),
        ...(currentData.tracking || {}),
        favorite:
          currentData.tracking?.favorite === true ||
          currentData.favorite === true ||
          player.tracking?.favorite === true ||
          player.favorite === true,
        watchlist:
          currentData.tracking?.watchlist === true ||
          currentData.watchlist === true ||
          player.tracking?.watchlist === true ||
          player.watchlist === true,
      },
      reason: SCOUTING_PLAYER_TRACKING_REASONS.PROFILE,
      trackedAt,
    })
    const profileEvents = buildScoutingPlayerReasonEvents({
      reason: SCOUTING_PLAYER_TRACKING_REASONS.PROFILE,
      season: seasonScope,
      team: resolvedTeam,
      player: scoutedPlayer,
      trackedAt,
    })
    const createdEvents = snapshot.exists()
      ? []
      : [buildCreatedEvent({
          season: seasonScope,
          team: resolvedTeam,
          trackedAt,
        })]
    const events = mergeScoutingPlayerEvents({
      currentEvents: currentData.events,
      nextEvents: [
        ...createdEvents,
        ...profileEvents,
      ],
    })
    const nextData = {
      ...baseDoc,
      favorite:
        currentData.favorite === true ||
        currentData.tracking?.favorite === true,
      tracking,
      playerReview: scoutedPlayer.playerReview || baseDoc.playerReview || null,
      manualImmediacyDecision:
        scoutedPlayer.manualImmediacyDecision ||
        baseDoc.manualImmediacyDecision ||
        null,
      verification,
      events,
      current: isHistory
        ? currentWithoutSeason
        : [...currentWithoutSeason, seasonDoc],
      history: isHistory
        ? [...historyWithoutSeason, seasonDoc]
        : historyWithoutSeason,
    }

    if (
      snapshot.exists() &&
      isPlayerDocStateUnchanged({
        currentData,
        nextData,
      })
    ) {
      return {
        playerDocumentId,
        created: false,
        updated: true,
        changed: false,
        writeSkipped: true,
        scoutProfilesCount: seasonDoc.scoutProfiles.length,
        trackingReason: SCOUTING_PLAYER_TRACKING_REASONS.PROFILE,
        scoutedPlayer: {
          ...scoutedPlayer,
          playerDocumentId,
        },
      }
    }

    transaction.set(ref, nextData, { merge: true })

    return {
      playerDocumentId,
      created: !snapshot.exists(),
      updated: true,
      changed: true,
      scoutProfilesCount: seasonDoc.scoutProfiles.length,
      trackingReason: SCOUTING_PLAYER_TRACKING_REASONS.PROFILE,
      scoutedPlayer: {
        ...scoutedPlayer,
        playerDocumentId,
      },
    }
  })
}

export const upsertOfficialPlayerDoc = upsertProfiledPlayerDoc
