// One user action, one transaction. Team Season is the source of truth;
// Player/SearchIndex/League are direct projections of the same calculated player.

import { buildPlayerLineClassificationState } from '../../../../domain/orchestration/buildPlayerLineClassificationState.js'
import { buildPlayerScoutState } from '../../../../domain/orchestration/buildPlayerScoutState.js'
import { buildTeamPlayerScoutProjection } from '../../../../domain/projections/playerScout.projection.js'
import { buildTeamBalanceSearchIndexProjection } from '../../../../domain/projections/teamBalanceSearchIndex.projection.js'
import { buildScoutProfilesSummary } from '../../../../model/scout/scoutProfilesSummary.model.js'
import { buildStatsPlayerDocumentSeasonRow } from '../../../../domain/statsV2/playerDocumentStats.projection.js'
import { withTeamBalanceSnapshot } from '../../../../domain/rosterV2/support/teams/teamBalanceSnapshot.js'
import {
  buildLineClassificationIndexFields,
} from '../../../../domain/rosterV2/support/searchIndex/player/playerSeasonIndex.model.js'
import {
  buildPlayerScoutIndexFields,
} from '../../../../domain/rosterV2/support/searchIndex/player/playerSeasonIndex.scout.js'
import {
  array,
  clean,
  findSeason,
  playerMatches,
  requireValue,
  seasonKey,
  teamDocumentId,
  teamId,
  unique,
} from '../../../../domain/edits/editIdentity.js'
import { data, executeEdit, reference } from '../shared/executeEdit.js'
import {
  assertLeague,
  assertTeam,
  readTeamIndexes,
  readTeamSeasonIndex,
  resolveTeamSeasonRef,
} from '../shared/validation.js'

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right)

const withoutTimestamp = value => {
  if (!value || typeof value !== 'object') return value
  const next = { ...value }
  delete next.updatedAt
  return next
}

const changedRow = (current, next, updatedAt) => (
  same(current, next) ? current : { ...next, updatedAt }
)

const replaceAt = (rows, index, value) => rows.map((row, rowIndex) => (
  rowIndex === index ? value : row
))

const findPlayer = (rows, identity, label) => {
  const matches = rows
    .map((row, index) => ({ row, index }))
    .filter(item => playerMatches(item.row, identity))

  return unique(matches, () => true, label)
}

const findPlayerSeason = ({ document, key, id, documentId }) => {
  const matches = ['current', 'history'].flatMap(field =>
    array(document[field] || [], 'עונות השחקן')
      .map((row, index) => ({ field, row, index })),
  ).filter(item => (
    seasonKey(item.row) === key &&
    teamId(item.row) === id &&
    teamDocumentId(item.row) === documentId
  ))

  return matches.length ? unique(matches, () => true, 'עונת השחקן') : null
}

const buildScoutedPlayer = ({ player, playerDocument, playerSeason, season, team }) => {
  const lineClassification = buildPlayerLineClassificationState({ player })
  const rolePlayer = { ...player, lineClassification }
  const targetSeason = {
    ...(playerSeason?.row || {}),
    ...rolePlayer,
  }
  const otherStints = ['current', 'history'].flatMap(field =>
    array(playerDocument?.[field] || [], 'עונות השחקן'),
  ).filter(row => row !== playerSeason?.row)
  const scoutState = buildPlayerScoutState({
    player: {
      ...rolePlayer,
      playerSeasonStints: [...otherStints, targetSeason],
      playerReview: playerDocument?.playerReview || player.playerReview || null,
      manualImmediacyDecision:
        playerDocument?.manualImmediacyDecision || player.manualImmediacyDecision || null,
      verification: playerDocument?.verification || player.verification || null,
    },
    team,
    season,
  })

  return {
    ...rolePlayer,
    ...scoutState,
    ...buildTeamPlayerScoutProjection(scoutState),
    lineClassification,
  }
}

const updateLeague = ({ league, key, id, summary, taskSignals, updatedAt }) => {
  const selected = findSeason(league, key)
  const rows = array(selected.row.tableRank || [], 'טבלת הליגה')
  const matches = rows
    .map((row, index) => ({ row, index }))
    .filter(item => teamId(item.row) === id)
  const teamRow = unique(matches, () => true, 'קבוצה בטבלת הליגה')
  const nextRow = changedRow(teamRow.row, {
    ...teamRow.row,
    scoutProfilesSummary: summary,
    teamTaskSignals: {
      offense: Boolean(taskSignals?.offense),
      defense: Boolean(taskSignals?.defense),
    },
  }, updatedAt)
  const nextSeason = changedRow(selected.row, {
    ...selected.row,
    tableRank: replaceAt(rows, teamRow.index, nextRow),
  }, updatedAt)

  if (selected.field === 'current') return { current: nextSeason }
  return {
    history: replaceAt(array(league.history || [], 'עונות הליגה'), selected.index, nextSeason),
  }
}

export async function updatePlayerLineClassification({
  league = {},
  season = {},
  team = {},
  player = {},
  primaryPosition = '',
  positionLayer = '',
  numShirt = '',
} = {}) {
  const leagueId = requireValue(
    clean(league.id || league.leagueId || season.leagueId || team.leagueId),
    'מזהה ליגה חסר',
  )
  const key = seasonKey(season)
  const id = requireValue(clean(team.birthTeamId || team.teamId), 'מזהה קבוצת שנתון חסר')
  const suppliedDocumentId = clean(team.birthTeamDocumentId || team.teamDocumentId)
  const playerId = requireValue(clean(player.playerId), 'מזהה שחקן חסר')

  const [teamIndexes, playerIndexes] = await Promise.all([
    readTeamSeasonIndex(id, key),
    readTeamIndexes(id, key, playerId),
  ])
  const resolvedTeamSeason = resolveTeamSeasonRef(teamIndexes, suppliedDocumentId, key)
  const playerIndex = unique(
    playerIndexes,
    item => data(item).entityType === 'playerSeason' && playerMatches(data(item), player),
    'אינדקס השחקן',
  )
  const indexData = data(playerIndex)
  const playerDocumentId = clean(indexData.playerDocumentId || player.playerDocumentId)
  const playerRef = playerDocumentId ? reference('players', playerDocumentId) : null
  const leagueRef = reference('leagues', leagueId)
  const refs = [
    resolvedTeamSeason.ref,
    resolvedTeamSeason.teamIndex.ref,
    playerIndex.ref,
    leagueRef,
    ...(playerRef ? [playerRef] : []),
  ]

  return executeEdit({
    refs,
    build: (get, updatedAt) => {
      const teamSeason = assertTeam(
        data(get(resolvedTeamSeason.ref)),
        id,
        resolvedTeamSeason.documentId,
        key,
        leagueId,
      )
      const teamIndex = assertTeam(
        data(get(resolvedTeamSeason.teamIndex.ref)),
        id,
        resolvedTeamSeason.documentId,
        key,
        leagueId,
      )
      const currentPlayerIndex = assertTeam(
        data(get(playerIndex.ref)),
        id,
        resolvedTeamSeason.documentId,
        key,
        leagueId,
      )
      requireValue(playerMatches(currentPlayerIndex, player), 'זהות אינדקס השחקן סותרת')

      const roster = array(teamSeason.teamPlayers, 'סגל הקבוצה')
      const selectedPlayer = findPlayer(roster, player, 'שחקן בסגל')
      const playerDocument = playerRef ? data(get(playerRef)) : null
      const playerSeason = playerDocument
        ? findPlayerSeason({
            document: playerDocument,
            key,
            id,
            documentId: resolvedTeamSeason.documentId,
          })
        : null
      requireValue(!playerDocument || playerSeason, 'עונת השחקן חסרה במסמך השחקן')

      const rolePlayer = {
        ...selectedPlayer.row,
        playerId,
        ...(playerDocumentId ? { playerDocumentId } : {}),
        primaryPosition: clean(primaryPosition),
        positionLayer: clean(positionLayer),
        numShirt: clean(numShirt || selectedPlayer.row.numShirt),
      }
      const effectiveSeason = {
        ...season,
        seasonId: clean(season.seasonId || teamSeason.seasonId),
        seasonKey: key,
        seasonStatus: clean(teamSeason.seasonStatus || season.seasonStatus),
        leagueId,
      }
      const effectiveTeam = {
        ...teamSeason,
        ...team,
        birthTeamId: id,
        teamId: id,
        birthTeamDocumentId: resolvedTeamSeason.documentId,
        teamDocumentId: resolvedTeamSeason.documentId,
      }
      const scoutedPlayer = buildScoutedPlayer({
        player: rolePlayer,
        playerDocument,
        playerSeason,
        season: effectiveSeason,
        team: effectiveTeam,
      })
      const nextTeamPlayer = {
        ...selectedPlayer.row,
        primaryPosition: scoutedPlayer.primaryPosition,
        positionLayer: scoutedPlayer.positionLayer,
        numShirt: scoutedPlayer.numShirt,
        lineClassification: scoutedPlayer.lineClassification,
        ...buildTeamPlayerScoutProjection(scoutedPlayer),
      }
      const nextRoster = replaceAt(
        roster,
        selectedPlayer.index,
        changedRow(selectedPlayer.row, nextTeamPlayer, updatedAt),
      )
      const summary = buildScoutProfilesSummary(nextRoster)
      const nextTeamSeasonBase = {
        ...teamSeason,
        teamPlayers: nextRoster,
        scoutProfilesSummary: summary,
      }
      const balanced = withTeamBalanceSnapshot({
        seasonDoc: nextTeamSeasonBase,
        teamRoot: effectiveTeam,
      })
      const projectedBalance = balanced.teamBalance || null
      const nextBalance = same(
        withoutTimestamp(teamSeason.teamBalance),
        withoutTimestamp(projectedBalance),
      )
        ? teamSeason.teamBalance
        : projectedBalance
          ? { ...projectedBalance, updatedAt }
          : projectedBalance
      const nextTeamSeason = {
        ...balanced,
        teamBalance: nextBalance,
      }
      const taskSignals = nextTeamSeason.teamBalance?.teamTaskSignals || {}
      const changes = [{ ref: resolvedTeamSeason.ref, patch: nextTeamSeason }]

      if (playerRef) {
        const projectedSeason = buildStatsPlayerDocumentSeasonRow({
          player: scoutedPlayer,
          season: effectiveSeason,
          team: effectiveTeam,
        })
        const nextPlayerSeason = changedRow(playerSeason.row, {
          ...playerSeason.row,
          ...projectedSeason,
        }, updatedAt)
        changes.push({
          ref: playerRef,
          patch: {
            primaryPosition: scoutedPlayer.primaryPosition,
            positionLayer: scoutedPlayer.positionLayer,
            numShirt: scoutedPlayer.numShirt,
            [playerSeason.field]: replaceAt(
              array(playerDocument[playerSeason.field] || [], 'עונות השחקן'),
              playerSeason.index,
              nextPlayerSeason,
            ),
          },
        })
      }

      changes.push({
        ref: playerIndex.ref,
        patch: {
          primaryPosition: scoutedPlayer.primaryPosition,
          positionLayer: scoutedPlayer.positionLayer,
          numShirt: scoutedPlayer.numShirt,
          ...buildLineClassificationIndexFields(scoutedPlayer),
          ...buildPlayerScoutIndexFields(scoutedPlayer),
        },
      })
      changes.push({
        ref: resolvedTeamSeason.teamIndex.ref,
        patch: {
          scoutProfilesSummary: summary,
          ...buildTeamBalanceSearchIndexProjection(nextTeamSeason.teamBalance),
        },
      })

      const canonicalLeague = assertLeague(data(get(leagueRef)), leagueId)
      changes.push({
        ref: leagueRef,
        patch: updateLeague({
          league: canonicalLeague,
          key,
          id,
          summary,
          taskSignals,
          updatedAt,
        }),
      })

      requireValue(
        clean(teamIndex.teamSeasonDocumentId) === resolvedTeamSeason.ref.id,
        'הפניית עונת הקבוצה סותרת',
      )
      return changes
    },
  })
}
