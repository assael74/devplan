// src/features/playersDatabase/services/write/player/edits/updatePlayerRootManual.js

import { clean, equal, requireValue, urlValue } from '../../../../domain/edits/editIdentity.js'
import { buildPlayerRoleEditState } from '../../../../domain/edits/playerRoleEdit.builder.js'
import { buildPlayerRootDocument } from '../../../../domain/playerRoot.builder.js'
import { buildPlayerId, buildPlayerSearchIndexDocumentId, buildPlayerSeasonDocumentId } from '../../../../domain/identity/index.js'
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

const readRoleEditTargets = async ({ indexRefs }) => {
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
  teamSeasonSnapshots.forEach(snapshot => {
    const teamSeason = requireManualEditDocument(snapshot)
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
  }
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

export const updatePlayerRole = async ({ playerId, primaryPosition, positionLayer, seasonDetails = null }) => {
  const id = requireValue(clean(playerId), 'מזהה שחקן חסר')
  const primary = clean(primaryPosition)
  const layer = clean(positionLayer)
  const hasShirt = seasonDetails && Object.prototype.hasOwnProperty.call(seasonDetails, 'numShirt')
  const hasUrl = seasonDetails && Object.prototype.hasOwnProperty.call(seasonDetails, 'playerUrl')
  const numShirt = hasShirt && seasonDetails.numShirt !== '' && seasonDetails.numShirt !== null
    ? Number(seasonDetails.numShirt)
    : null
  if (hasShirt && numShirt !== null && (!Number.isSafeInteger(numShirt) || numShirt < 1)) {
    throw new Error('מספר חולצה חייב להיות מספר שלם וחיובי')
  }
  const playerUrl = hasUrl ? urlValue(seasonDetails.playerUrl) : ''
  const ref = playerRootRef(id)
  const indexRefs = await readManualEditRefs('playerSearchIndexes', { playerId: id })
  const {
    teamSeasonRefs,
    playerSeasonRefs,
    leagueRefs,
    leagueRefsById,
  } = await readRoleEditTargets({ indexRefs })

  return executeManualEdit({
    refreshSignals: true,
    refs: [
      ref,
      ...indexRefs,
      ...teamSeasonRefs,
      ...playerSeasonRefs,
      ...leagueRefs,
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
      if (hasShirt || hasUrl) {
        const teamId = requireValue(clean(seasonDetails.teamId), 'זהות הקבוצה חסרה')
        const seasonId = requireValue(clean(seasonDetails.seasonId), 'זהות העונה חסרה')
        const documentId = requireValue(clean(seasonDetails.teamSeasonDocumentId), 'זהות עונת הקבוצה חסרה')
        const teamRef = teamSeasonRefs.find(item => item.path === manualEditRef('teamSeasons', documentId).path)
        const seasonRef = playerSeasonRefs.find(item => item.path === manualEditRef(
          'playerSeasons', buildPlayerSeasonDocumentId({ playerId: id, seasonId }),
        ).path)
        const indexRef = indexRefs.find(item => item.path === manualEditRef(
          'playerSearchIndexes',
          buildPlayerSearchIndexDocumentId({ playerId: id, teamSeasonDocumentId: documentId }),
        ).path)
        requireValue(teamRef && seasonRef && indexRef, 'מסמכי עונת השחקן חסרים; לא בוצעה שמירה')
        const team = requireManualEditDocument(get(teamRef))
        const playerSeason = requireManualEditDocument(get(seasonRef))
        const index = requireManualEditDocument(get(indexRef))
        const seasonTeam = playerSeason.teamsById?.[teamId]
        requireValue(
          clean(team.identity?.teamSeasonDocumentId) === documentId &&
          clean(team.identity?.teamId) === teamId &&
          clean(team.identity?.seasonId) === seasonId &&
          clean(playerSeason.identity?.playerId) === id &&
          clean(playerSeason.identity?.seasonId) === seasonId &&
          clean(index.playerId) === id &&
          clean(index.seasonId) === seasonId &&
          clean(index.references?.teamSeasonDocumentId) === documentId &&
          seasonTeam && team.roster?.playersById?.[id],
          'זהות עונת השחקן סותרת',
        )
        if (hasShirt) {
          requireValue(clean(team.stats?.statsLoadState?.status) === 'loaded', 'אפשר לערוך מספר חולצה רק לאחר טעינת סטטיסטיקה')
        }
        const shirtValue = numShirt === null ? '' : String(numShirt)
        const teamShirtChanged = hasShirt && (team.roster.playersById[id].numShirt === undefined
          ? null
          : team.roster.playersById[id].numShirt) !== numShirt
        const teamUrlChanged = hasUrl && clean(team.manual?.playersById?.[id]?.playerUrl) !== playerUrl
        const seasonShirtChanged = hasShirt && (seasonTeam.roster?.numShirt === undefined
          ? null
          : seasonTeam.roster.numShirt) !== numShirt
        const seasonUrlChanged = hasUrl && clean(seasonTeam.manual?.playerUrl) !== playerUrl
        const indexShirtChanged = hasShirt && clean(index.player?.numShirt) !== shirtValue
        const indexUrlChanged = hasUrl && clean(index.player?.playerUrl) !== playerUrl
        const ensureChange = ref => {
          let change = changes.find(item => item.ref.path === ref.path)
          if (!change) {
            change = { ref, patch: {} }
            changes.push(change)
          }
          return change
        }
        if (teamShirtChanged || teamUrlChanged) {
          const patch = ensureChange(teamRef).patch
          if (teamShirtChanged) {
            patch[`roster.playersById.${id}.numShirt`] = numShirt
            patch[`roster.playersById.${id}.updatedAt`] = updatedAt
            patch['roster.updatedAt'] = updatedAt
          }
          if (teamUrlChanged) {
            patch[`manual.playersById.${id}.playerUrl`] = playerUrl
            patch[`manual.playersById.${id}.updatedAt`] = updatedAt
            patch['manual.updatedAt'] = updatedAt
          }
        }
        if (seasonShirtChanged || seasonUrlChanged) {
          const patch = ensureChange(seasonRef).patch
          const key = `teamsById.${teamId}`
          if (patch[key]) {
            patch[key] = {
              ...patch[key],
              ...(seasonShirtChanged ? { roster: { ...(patch[key].roster || {}), numShirt } } : {}),
              ...(seasonUrlChanged ? { manual: { ...(patch[key].manual || {}), playerUrl } } : {}),
            }
          } else {
            if (seasonShirtChanged) patch[`${key}.roster.numShirt`] = numShirt
            if (seasonUrlChanged) patch[`${key}.manual.playerUrl`] = playerUrl
          }
        }
        if (indexShirtChanged || indexUrlChanged) {
          const patch = ensureChange(indexRef).patch
          patch.player = {
            ...(patch.player || index.player || {}),
            ...(indexShirtChanged ? { numShirt: shirtValue } : {}),
            ...(indexUrlChanged ? { playerUrl } : {}),
          }
        }
      }
      return changes
    },
  })
}
