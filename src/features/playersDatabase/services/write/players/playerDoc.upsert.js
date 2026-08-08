// features/playersDatabase/services/write/players/playerDoc.upsert.js

import { deleteField } from 'firebase/firestore'

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

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
export const upsertProfiledPlayerDoc = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
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
  const teamDoc = teamDocumentId ? await getTeamById(teamDocumentId) : null
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

    const nextData = {
      ...baseDoc,
      scoutProfiles: deleteField(),
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
    }
  })
}

export const upsertOfficialPlayerDoc = upsertProfiledPlayerDoc
