// src/features/playersDatabase/services/write/flows/player/removePlayerScoutProfile.coordinated.js

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import { buildSeasonKey, clean } from '../../leagues/leagueDoc.js'
import {
  buildPlayerSeasonScoutProfileRemoval,
  playerDocRef,
} from '../../players/playerDoc.js'
import {
  buildPlayerAliases,
  buildPlayerSeasonIndexDoc,
} from '../../searchIndex/player/playerSeasonIndex.model.js'
import { resolvePlayerSeasonIndexTargetForPayload } from '../../searchIndex/player/playerSeasonIndex.query.js'
import { buildTeamPlayerScoutProjection } from '../../shared/playerScoutProjection.js'
import { buildScoutProfilesSummary } from '../../../../model/scoutProfilesSummary.model.js'
import { resolveTeamLookupKey } from '../../../../model/teamIdentity.model.js'
import { resolveWritablePlayerDocumentId } from '../../../../model/playerIdentity.model.js'
import { buildTeamSeasonDocumentData, teamSeasonDocRef } from '../../teams/teamSeasonDoc.js'
import { getPlayerMergeKey, normalizeTeamPlayer } from '../../teams/teamSeason.model.js'
import { withTeamBalanceSnapshot } from '../../teams/teamBalanceSnapshot.js'

const buildRosterOnlyOrLinkedIndex = ({
  existingData = {},
  existingId = '',
  league = {},
  season = {},
  team = {},
  player = {},
  target = 'current',
} = {}) => {
  const indexDoc = buildPlayerSeasonIndexDoc({ league, season, team, player, target })
  const id = clean(existingId) || indexDoc.id
  return {
    ...indexDoc,
    id,
    entityId: id,
    aliases: buildPlayerAliases({
      player,
      displayName: indexDoc.displayName,
      existingAliases: existingData.aliases,
    }),
    playerUrl: clean(indexDoc.playerUrl || existingData.playerUrl),
    notes: clean(player.notes || existingData.notes),
  }
}

// The query that resolves a legacy/current index happens before this function.
// From here onward all lifecycle writes are governed by one Firestore
// transaction, including a re-read of the resolved index target.
export const removePlayerScoutProfileCoordinated = async ({
  league = {},
  season = {},
  team = {},
  player = {},
  target = 'current',
  profileId = '',
} = {}) => {
  const teamId = resolveTeamLookupKey(team)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(season.seasonId)
  const playerKey = getPlayerMergeKey(player)
  const playerDocumentId = clean(resolveWritablePlayerDocumentId(player))
  if (!teamId || !seasonKey || !playerKey || !playerDocumentId) {
    throw new Error('Missing coordinated profile-removal identity')
  }

  const indexTarget = await resolvePlayerSeasonIndexTargetForPayload({
    league,
    season,
    team: { ...team, birthTeamDocumentId: teamId },
    player,
  })
  const playerRef = playerDocRef(playerDocumentId)
  const teamSeasonRef = teamSeasonDocRef({
    birthTeamDocumentId: teamId,
    seasonKey,
  })
  const indexRef = indexTarget.snapshot?.ref || null

  return trackedRunTransaction(db, async transaction => {
    const [playerSnapshot, teamSeasonSnapshot, indexSnapshot] = await Promise.all([
      transaction.get(playerRef),
      transaction.get(teamSeasonRef),
      indexRef ? transaction.get(indexRef) : Promise.resolve(null),
    ])
    if (!playerSnapshot.exists()) {
      return { updated: false, reason: 'playerDocMissing', playerDocumentId }
    }
    if (!teamSeasonSnapshot.exists()) {
      return { updated: false, reason: 'teamSeasonMissing', playerDocumentId }
    }

    const playerRemoval = buildPlayerSeasonScoutProfileRemoval({
      profileId,
      season,
      team: { ...team, birthTeamDocumentId: teamId },
      player: { ...player, playerDocumentId },
      target,
      data: playerSnapshot.data() || {},
    })
    if (!playerRemoval.updated) return playerRemoval

    const currentTeamSeason = teamSeasonSnapshot.data() || {}
    const teamPlayers = Array.isArray(currentTeamSeason.teamPlayers)
      ? currentTeamSeason.teamPlayers
      : []
    const teamPlayerIndex = teamPlayers.findIndex(row => (
      getPlayerMergeKey(row) === playerKey
    ))

    // A roster row is the authority for whether this player-season index may
    // exist.  Do not retain an orphan index merely because a Player document
    // happened to exist before profile removal.
    if (teamPlayerIndex === -1) {
      if (playerRemoval.shouldDelete) transaction.delete(playerRef)
      else transaction.set(playerRef, {
        tracking: playerRemoval.tracking,
        [playerRemoval.fieldKey]: playerRemoval.nextDocument[playerRemoval.fieldKey],
      }, { merge: true })
      if (indexSnapshot?.exists()) transaction.delete(indexRef)
      return {
        updated: true,
        playerDocumentId,
        playerSeasonResult: { ...playerRemoval, deleted: playerRemoval.shouldDelete },
        teamSeasonResult: { updated: false, reason: 'teamPlayerMissing' },
        playerSeasonIndexResult: {
          updated: Boolean(indexSnapshot?.exists()),
          deleted: Boolean(indexSnapshot?.exists()),
        },
      }
    }

    if (!indexSnapshot?.exists() && indexRef) {
      throw new Error('Resolved Player Season SearchIndex disappeared before transaction')
    }
    if (!indexSnapshot?.exists() && !indexRef) {
      throw new Error('Player Season SearchIndex is missing')
    }

    const existingTeamPlayer = teamPlayers[teamPlayerIndex]
    const nextTeamPlayer = normalizeTeamPlayer({
      ...existingTeamPlayer,
      ...buildTeamPlayerScoutProjection(playerRemoval.player),
      playerDocumentId: playerRemoval.shouldDelete ? '' : playerDocumentId,
    }, currentTeamSeason)
    const nextPlayers = teamPlayers.map((row, index) => (
      index === teamPlayerIndex ? nextTeamPlayer : row
    ))
    const scoutProfilesSummary = buildScoutProfilesSummary(nextPlayers)
    const nextTeamSeason = withTeamBalanceSnapshot({
      seasonDoc: {
        ...currentTeamSeason,
        teamPlayers: nextPlayers,
        playersCount: nextPlayers.length,
        scoutProfilesSummary,
        updatedAt: new Date().toISOString(),
      },
      teamRoot: { ...team, id: teamId, birthTeamDocumentId: teamId },
    })
    const persistedTeamSeason = buildTeamSeasonDocumentData({
      team: { ...team, birthTeamDocumentId: teamId },
      season: { ...season, seasonKey },
      seasonDoc: nextTeamSeason,
      existingData: currentTeamSeason,
    })
    const indexPlayer = {
      ...playerRemoval.player,
      ...nextTeamPlayer,
      playerDocumentId: playerRemoval.shouldDelete ? '' : playerDocumentId,
    }
    const existingIndexData = indexSnapshot.data() || {}
    const nextIndex = buildRosterOnlyOrLinkedIndex({
      existingData: existingIndexData,
      existingId: indexSnapshot.id,
      league,
      season: {
        ...season,
        seasonStatus: currentTeamSeason.seasonStatus || season.seasonStatus,
      },
      target,
      team: {
        ...team,
        ...persistedTeamSeason,
        birthTeamDocumentId: teamId,
      },
      player: indexPlayer,
    })

    if (playerRemoval.shouldDelete) transaction.delete(playerRef)
    else transaction.set(playerRef, {
      tracking: playerRemoval.tracking,
      [playerRemoval.fieldKey]: playerRemoval.nextDocument[playerRemoval.fieldKey],
    }, { merge: true })
    transaction.set(teamSeasonRef, persistedTeamSeason)
    transaction.set(indexRef, nextIndex)

    return {
      updated: true,
      playerDocumentId,
      playerSeasonResult: { ...playerRemoval, deleted: playerRemoval.shouldDelete },
      teamSeasonResult: {
        updated: true,
        teamSeasonDocumentId: teamSeasonRef.id,
        player: nextTeamPlayer,
        players: nextPlayers,
        scoutProfilesSummary,
        seasonDocument: persistedTeamSeason,
      },
      playerSeasonIndexResult: {
        updated: true,
        id: indexRef.id,
        rosterOnly: playerRemoval.shouldDelete,
      },
    }
  })
}
