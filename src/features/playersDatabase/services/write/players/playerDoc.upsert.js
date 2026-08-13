// features/playersDatabase/services/write/players/playerDoc.upsert.js

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
    const seasonDoc = buildPlayerSeasonDoc({
      season: {
        ...season,
        seasonId,
        seasonKey,
      },
      team: resolvedTeam,
      player,
    })

    const shouldHydrateFromTeamDoc = !snapshot.exists() && teamDoc
    const hydratedRows = shouldHydrateFromTeamDoc
      ? buildPlayerSeasonRowsFromTeamDoc({
          teamDoc,
          season: {
            ...season,
            seasonId,
            seasonKey,
          },
          team: resolvedTeam,
          player,
          target: isHistory ? 'history' : 'current',
        })
      : {
          current: [],
          history: [],
        }

    const seasonScope = {
      ...season,
      seasonId,
      seasonKey,
    }
    const sourceCurrentRows = snapshot.exists()
      ? baseDoc.current
      : hydratedRows.current
    const sourceHistoryRows = snapshot.exists()
      ? baseDoc.history
      : hydratedRows.history
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

    const trackedAt = new Date().toISOString()
    const tracking = buildScoutingPlayerTracking({
      currentTracking: {
        ...(currentData.tracking || {}),
        favorite:
          currentData.tracking?.favorite === true ||
          currentData.favorite === true,
        watchlist:
          currentData.tracking?.watchlist === true ||
          currentData.watchlist === true,
      },
      reason: SCOUTING_PLAYER_TRACKING_REASONS.PROFILE,
      trackedAt,
    })
    const profileEvents = buildScoutingPlayerReasonEvents({
      reason: SCOUTING_PLAYER_TRACKING_REASONS.PROFILE,
      season: seasonScope,
      team: resolvedTeam,
      player,
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
      verification: normalizeScoutingPlayerVerification(
        currentData.verification
      ),
      events,
      current: isHistory
        ? currentWithoutSeason
        : [...currentWithoutSeason, seasonDoc],
      history: isHistory
        ? [...historyWithoutSeason, seasonDoc]
        : historyWithoutSeason,
    }

    transaction.set(ref, nextData, { merge: true })

    return {
      playerDocumentId,
      created: !snapshot.exists(),
      scoutProfilesCount: seasonDoc.scoutProfiles.length,
      trackingReason: SCOUTING_PLAYER_TRACKING_REASONS.PROFILE,
    }
  })
}

export const upsertOfficialPlayerDoc = upsertProfiledPlayerDoc
