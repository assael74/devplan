// src/features/playersDatabase/services/write/player/edits/updatePlayerRootManual.js

import { clean, equal, requireValue } from '../../../../domain/edits/editIdentity.js'
import { buildPlayerRoleEditState } from '../../../../domain/edits/playerRoleEdit.builder.js'
import { buildPlayerRootDocument } from '../../../../domain/playerRoot.builder.js'
import { buildPlayerId, buildPlayerSeasonDocumentId } from '../../../../domain/identity/index.js'
import { buildPlayerSeasonProjection } from '../../../../domain/stats/statsProjection.builder.js'
import {
  executeManualEdit,
  manualEditRef,
  readManualEditDocument,
  readManualEditRefs,
  requireManualEditDocument,
} from '../../shared/manualEdit.write.js'

const playerRootRef = playerId => manualEditRef(
  'playerRoots',
  requireValue(clean(playerId), 'מזהה שחקן חסר'),
)

const readTeamSeasonRefs = async indexRefs => {
  const indexSnapshots = await Promise.all(indexRefs.map(readManualEditDocument))
  return [...new Map(indexSnapshots.map(snapshot => {
    const index = requireManualEditDocument(snapshot)
    const documentId = requireValue(
      clean(index.references?.teamSeasonDocumentId),
      'הפניית עונת הקבוצה חסרה',
    )
    const teamSeasonRef = manualEditRef('teamSeasons', documentId)
    return [teamSeasonRef.path, teamSeasonRef]
  })).values()]
}

const readRoleEditTargets = async ({ indexRefs, playerId }) => {
  const indexSnapshots = await Promise.all(indexRefs.map(readManualEditDocument))
  const indexes = indexSnapshots.map(requireManualEditDocument)
  const teamSeasonRefs = [...new Map(indexes.map(index => {
    const documentId = requireValue(
      clean(index.references?.teamSeasonDocumentId),
      'הפניית עונת הקבוצה חסרה',
    )
    const ref = manualEditRef('teamSeasons', documentId)
    return [ref.path, ref]
  })).values()]
  const playerSeasonRefs = [...new Map(indexes
    .map(index => clean(index.references?.playerSeasonDocumentId))
    .filter(Boolean)
    .map(documentId => {
      const ref = manualEditRef('playerSeasons', documentId)
      return [ref.path, ref]
    })).values()]
  const teamSeasonSnapshots = await Promise.all(teamSeasonRefs.map(readManualEditDocument))
  const leagueRefsById = new Map()
  const clubsCenterRefsBySeasonId = new Map()
  teamSeasonSnapshots.forEach(snapshot => {
    const teamSeason = requireManualEditDocument(snapshot)
    if (clean(teamSeason.stats?.playersById?.[playerId]?.statsStatus) === 'loaded') {
      const seasonId = requireValue(clean(teamSeason.identity?.seasonId), 'זהות העונה חסרה')
      clubsCenterRefsBySeasonId.set(seasonId, manualEditRef('clubsCenter', seasonId))
    }
    const leagueId = clean(teamSeason.identity?.leagueId)
    if (!leagueId) return
    const leagueRef = manualEditRef('leagues', leagueId)
    leagueRefsById.set(leagueId, leagueRef)
  })

  return {
    teamSeasonRefs,
    playerSeasonRefs,
    leagueRefs: [...leagueRefsById.values()],
    leagueRefsById,
    leaguesCenterRef: clubsCenterRefsBySeasonId.size ? manualEditRef('leaguesCenter', 'all') : null,
    clubsCenterRefsBySeasonId,
  }
}

const appendRoleCenterPatches = ({
  get,
  identity,
  teamTaskSignals,
  leaguesCenterRef,
  clubsCenterRefsBySeasonId,
  patchesByPath,
}) => {
  const leagueId = requireValue(clean(identity.leagueId), 'זהות הליגה חסרה')
  const seasonId = requireValue(clean(identity.seasonId), 'זהות העונה חסרה')
  const teamId = requireValue(clean(identity.teamId), 'זהות הקבוצה חסרה')
  const clubId = requireValue(clean(identity.clubId), 'זהות המועדון חסרה')
  const clubsCenterRef = clubsCenterRefsBySeasonId.get(seasonId)
  requireValue(leaguesCenterRef && clubsCenterRef, 'יעדי המרכזים השתנו; יש לנסות לשמור מחדש')
  const leaguesCenter = requireManualEditDocument(get(leaguesCenterRef))
  const clubsCenter = requireManualEditDocument(get(clubsCenterRef))
  requireValue(
    leaguesCenter.leaguesById?.[leagueId]?.seasonsById?.[seasonId]?.teamsById?.[teamId],
    'הקבוצה חסרה במרכז הליגות; יש לתקן אותה באודיט לפני שמירת התפקיד',
  )
  requireValue(
    clubsCenter.clubsById?.[clubId]?.teamsById?.[teamId],
    'הקבוצה חסרה במרכז המועדונים; יש לתקן אותה באודיט לפני שמירת התפקיד',
  )
  ;[
    [leaguesCenterRef, `leaguesById.${leagueId}.seasonsById.${seasonId}.teamsById.${teamId}.teamTaskSignals`],
    [clubsCenterRef, `clubsById.${clubId}.teamsById.${teamId}.teamTaskSignals`],
  ].forEach(([ref, field]) => {
    const change = patchesByPath.get(ref.path) || { ref, patch: {} }
    change.patch[field] = teamTaskSignals
    patchesByPath.set(ref.path, change)
  })
}

const buildMissingPlayerRoot = ({
  id,
  teamSeasonRefs,
  get,
  updatedAt,
  values,
}) => {
  const seasonRefsById = {}
  let rosterPlayer = null
  teamSeasonRefs.forEach(teamSeasonRef => {
    const teamSeason = requireManualEditDocument(get(teamSeasonRef))
    const seasonId = requireValue(clean(teamSeason.identity?.seasonId), 'זהות העונה חסרה')
    const currentRosterPlayer = teamSeason.roster?.playersById?.[id]
    if (!currentRosterPlayer) return
    rosterPlayer = rosterPlayer || currentRosterPlayer
    seasonRefsById[seasonId] = {
      seasonKey: clean(teamSeason.identity?.seasonKey),
      playerSeasonDocumentId: buildPlayerSeasonDocumentId({ playerId: id, seasonId }),
      seasonStatus: clean(teamSeason.identity?.seasonStatus),
    }
  })
  requireValue(rosterPlayer && clean(rosterPlayer.externalPlayerId), 'אין סגל קנוני ליצירת מסמך השחקן')
  requireValue(
    buildPlayerId({
      birthYear: Number(String(id).split('__')[1]),
      externalPlayerId: clean(rosterPlayer.externalPlayerId),
    }) === id,
    'זהות השחקן בסגל סותרת',
  )
  return buildPlayerRootDocument({
    playerId: id,
    rosterPlayer,
    seasonRefsById,
    updatedAt,
    ...values,
  })
}

export const updatePlayerNotes = async ({ playerId, notes }) => {
  const id = requireValue(clean(playerId), 'מזהה שחקן חסר')
  const value = clean(notes)
  const ref = playerRootRef(id)
  const indexRefs = await readManualEditRefs('playerSearchIndexes', { playerId: id })
  const rootSnapshot = await readManualEditDocument(ref)
  const teamSeasonRefs = rootSnapshot.exists() ? [] : await readTeamSeasonRefs(indexRefs)

  return executeManualEdit({
    refs: [ref, ...indexRefs, ...teamSeasonRefs],
    build: ({ get, updatedAt }) => {
      const playerSnapshot = get(ref)
      const player = playerSnapshot.exists() ? playerSnapshot.data() : null
      if (player) requireValue(clean(player.identity?.playerId) === id, 'זהות השחקן סותרת')
      const changes = !player
        ? [{
            ref,
            document: buildMissingPlayerRoot({
              id,
              teamSeasonRefs,
              get,
              updatedAt,
              values: { notes: value },
            }),
          }]
        : clean(player.notes) === value
          ? []
          : [{ ref, patch: { notes: value } }]
      indexRefs.forEach(indexRef => {
        const index = requireManualEditDocument(get(indexRef))
        requireValue(clean(index.playerId) === id, 'זהות תוצר החיפוש סותרת')
        if (clean(index.player?.notes) !== value) {
          changes.push({
            ref: indexRef,
            patch: { player: { ...(index.player || {}), notes: value } },
          })
        }
      })
      return changes
    },
  })
}

export const updatePlayerAgent = ({ playerId, agent = {} }) => {
  const id = requireValue(clean(playerId), 'מזהה שחקן חסר')
  const status = ['yes', 'no', 'unknown'].includes(clean(agent.status))
    ? clean(agent.status)
    : 'unknown'
  const value = { status, phones: clean(agent.phones) }
  const ref = playerRootRef(id)

  return executeManualEdit({
    refs: [ref],
    build: ({ get, updatedAt }) => {
      const player = requireManualEditDocument(get(ref))
      requireValue(clean(player.identity?.playerId) === id, 'זהות השחקן סותרת')
      const next = { ...value, updatedAt }
      return equal(
        { status: clean(player.agent?.status), phones: clean(player.agent?.phones) },
        value,
      ) ? [] : [{ ref, patch: { agent: next } }]
    },
  })
}

export const updatePlayerRole = async ({ playerId, primaryPosition, positionLayer }) => {
  const id = requireValue(clean(playerId), 'מזהה שחקן חסר')
  const primary = clean(primaryPosition)
  const layer = clean(positionLayer)
  const ref = playerRootRef(id)
  const indexRefs = await readManualEditRefs('playerSearchIndexes', { playerId: id })
  const {
    teamSeasonRefs,
    playerSeasonRefs,
    leagueRefs,
    leagueRefsById,
    leaguesCenterRef,
    clubsCenterRefsBySeasonId,
  } = await readRoleEditTargets({ indexRefs, playerId: id })

  return executeManualEdit({
    refs: [
      ref,
      ...indexRefs,
      ...teamSeasonRefs,
      ...playerSeasonRefs,
      ...leagueRefs,
      ...(leaguesCenterRef ? [leaguesCenterRef] : []),
      ...clubsCenterRefsBySeasonId.values(),
    ],
    build: ({ get, updatedAt }) => {
      const playerSnapshot = get(ref)
      const player = playerSnapshot.exists() ? playerSnapshot.data() : null
      if (player) requireValue(clean(player.identity?.playerId) === id, 'זהות השחקן סותרת')
      const changes = []
      if (!player) {
        changes.push({
          ref,
          document: buildMissingPlayerRoot({
            id,
            teamSeasonRefs,
            get,
            updatedAt,
            values: { primaryPosition: primary, positionLayer: layer },
          }),
        })
      } else if (clean(player.primaryPosition) !== primary || clean(player.positionLayer) !== layer) {
        changes.push({
          ref,
          patch: { primaryPosition: primary, positionLayer: layer },
        })
      }
      indexRefs.forEach(indexRef => {
        const index = requireManualEditDocument(get(indexRef))
        requireValue(clean(index.playerId) === id, 'זהות תוצר החיפוש סותרת')
        if (
          clean(index.player?.primaryPosition) !== primary ||
          clean(index.player?.positionLayer) !== layer
        ) {
          changes.push({
            ref: indexRef,
            patch: {
              player: {
                ...(index.player || {}),
                primaryPosition: primary,
                positionLayer: layer,
              },
            },
          })
        }
      })
      const roleStatesByTeamSeasonId = new Map()
      const leaguePatchesByPath = new Map()
      const centerPatchesByPath = new Map()
      teamSeasonRefs.forEach(teamSeasonRef => {
        const teamSeason = requireManualEditDocument(get(teamSeasonRef))
        const identity = teamSeason.identity || {}
        const teamSeasonDocumentId = requireValue(
          clean(
            identity.teamSeasonDocumentId ||
            teamSeason.id ||
            teamSeasonRef.path.split('/').pop()
          ),
          'זהות עונת הקבוצה חסרה',
        )
        const statsPlayer = teamSeason.stats?.playersById?.[id]
        const hasLoadedStats = clean(statsPlayer?.statsStatus) === 'loaded'
        const leagueId = hasLoadedStats
          ? requireValue(clean(identity.leagueId), 'זהות הליגה חסרה')
          : clean(identity.leagueId)
        const leagueRef = leagueRefsById.get(leagueId)
        const league = hasLoadedStats
          ? requireManualEditDocument(get(leagueRef))
          : {}
        const roleState = buildPlayerRoleEditState({
          teamSeason,
          league,
          playerId: id,
          primaryPosition: primary,
          positionLayer: layer,
          updatedAt,
        })
        const teamSeasonPatch = {}
        if (roleState.scoutingPlayer) {
          teamSeasonPatch[`scouting.playersById.${id}`] = roleState.scoutingPlayer
          teamSeasonPatch['scouting.updatedAt'] = updatedAt
        }
        if (roleState.statsChanged) {
          teamSeasonPatch[`stats.playersById.${id}`] = roleState.statsPlayer
          teamSeasonPatch['stats.teamBalance'] = roleState.teamBalance
          teamSeasonPatch['stats.updatedAt'] = updatedAt
          teamSeasonPatch.teamTaskSignals = roleState.teamTaskSignals
          teamSeasonPatch.teamTaskAvailability = roleState.teamTaskAvailability
          const leaguePatch = leaguePatchesByPath.get(leagueRef.path) || {
            ref: leagueRef,
            patch: {},
          }
          leaguePatch.patch[
            `seasonsById.${clean(identity.seasonId)}.table.teamsById.${clean(identity.teamId)}.scouting.teamTaskSignals`
          ] = roleState.teamTaskSignals
          leaguePatchesByPath.set(leagueRef.path, leaguePatch)
          appendRoleCenterPatches({
            get,
            identity,
            teamTaskSignals: roleState.teamTaskSignals,
            leaguesCenterRef,
            clubsCenterRefsBySeasonId,
            patchesByPath: centerPatchesByPath,
          })
        }
        if (Object.keys(teamSeasonPatch).length) {
          const projectedTeamSeason = {
            ...teamSeason,
            scouting: {
              ...teamSeason.scouting,
              playersById: {
                ...teamSeason.scouting?.playersById,
                [id]: roleState.scoutingPlayer,
              },
            },
          }
          const projection = buildPlayerSeasonProjection({
            playerId: id,
            teamSeason: projectedTeamSeason,
            league,
            seasonId: clean(identity.seasonId),
            updatedAt,
          })
          roleStatesByTeamSeasonId.set(teamSeasonDocumentId, {
            ...roleState,
            teamId: clean(identity.teamId),
            scoutingProjection: projection.team.scouting,
          })
          changes.push({ ref: teamSeasonRef, patch: teamSeasonPatch })
        }
      })
      playerSeasonRefs.forEach(playerSeasonRef => {
        const playerSeason = requireManualEditDocument(get(playerSeasonRef))
        const projectionPatch = {}
        Object.entries(playerSeason.teamsById || {}).forEach(([teamId, teamContext]) => {
          const roleState = roleStatesByTeamSeasonId.get(
            clean(teamContext && teamContext.teamSeasonDocumentId),
          )
          if (!roleState || roleState.teamId !== teamId) return
          const nextTeamContext = { ...teamContext, updatedAt }
          if (roleState.statsChanged) {
            nextTeamContext.stats = {
              ...(teamContext.stats || {}),
              lineClassification: {
                ...roleState.statsPlayer.lineClassification,
              },
            }
          }
          if (roleState.scoutingPlayer) nextTeamContext.scouting = roleState.scoutingProjection
          projectionPatch[`teamsById.${teamId}`] = nextTeamContext
        })
        if (Object.keys(projectionPatch).length) {
          changes.push({ ref: playerSeasonRef, patch: projectionPatch })
        }
      })
      leaguePatchesByPath.forEach(change => changes.push(change))
      centerPatchesByPath.forEach(change => changes.push(change))
      return changes
    },
  })
}
