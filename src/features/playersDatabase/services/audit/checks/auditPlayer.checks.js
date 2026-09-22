import {
  buildTeamPlayerScoutContext,
  buildTeamPlayerSeasonalScoutProjection,
} from '../audit.projections.js'
import { buildAuditFinding, AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE } from '../audit.contract.js'

export function appendPlayerSeasonAuditFindings({
  id,
  season,
  teamId,
  seasonKey,
  root,
  leagues,
  rootsById,
  playerDocsById,
  playerIndexes,
  findings,
  lifecycle,
  helpers,
}) {
  const {
    clean,
    profilesOf,
    findPlayerSeasonRow,
    sameProfiles,
    playerAuditDetails,
    playerIndexKey,
    samePlayerSearchIndexProfiles,
    profileIdsOf,
    normalizedProfilesOf,
    findLeagueSeason,
  } = helpers

  const leagueSource = findLeagueSeason({
    leagues,
    leagueId: season.leagueId,
    seasonKey,
  })
  const teamScoutContext = {
    ...(root || {}),
    ...season,
    teamGamePlayed: Number(season?.teamGamePlayed || season?.teamStats?.teamGamePlayed) || 0,
    goalsFor: Number(season?.goalsFor || season?.teamStats?.goalsFor) || 0,
    goalsAgainst: Number(season?.goalsAgainst || season?.teamStats?.goalsAgainst) || 0,
    offense: season?.offense || season?.teamAttackPerformance || {},
    defense: season?.defense || season?.teamDefensePerformance || {},
  }
  const scoutSeason = {
    ...(leagueSource?.season || {}),
    ...season,
    seasonId: season.seasonId || seasonKey,
    seasonKey,
    seasonStatus: season.seasonStatus || leagueSource?.season?.seasonStatus,
    leagueTotalRound: Number(
      season?.leagueTotalRound || leagueSource?.season?.leagueTotalRound || 0
    ),
  }

  ;(Array.isArray(season.teamPlayers) ? season.teamPlayers : []).forEach(player => {
    const playerDocumentId = clean(player.playerDocumentId)
    const playerIdentity = {
      playerDocumentId,
      playerId: clean(player.playerId),
      externalPlayerId: clean(player.externalPlayerId),
      playerDisplayName: clean(player.fullName || player.matchedPlayerName || player.displayName),
    }
    const isOutOfRosterScope = clean(player.rosterStatus || 'regular') !== 'regular'
    const profiled = !isOutOfRosterScope && profilesOf(player).length > 0
    lifecycle.push({
      entityType: 'player',
      documentId: playerDocumentId || clean(player.playerId || player.externalPlayerId),
      teamDocumentId: teamId,
      playerDocumentId,
      seasonKey,
      status: isOutOfRosterScope ? 'out_of_roster_scope' : profiled ? 'profiled' : 'roster_only',
    })
    if (profiled && (!playerDocumentId || !playerDocsById.has(playerDocumentId))) {
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
        entityType: 'player',
        documentId: playerDocumentId,
        teamDocumentId: teamId,
        ...playerIdentity,
        seasonKey,
        title: 'חסר מסמך שחקן',
        explanation: 'לשחקן שקיבל פרופיל סקאוט, כולל Preliminary, חייב להיות Player Document.',
        source: 'Team Season scout profile lifecycle',
        repairType: AUDIT_REPAIR_TYPE.CREATE_PLAYER_DOCUMENT,
      }))
    }
    if (profiled && playerDocumentId && playerDocsById.has(playerDocumentId)) {
      const playerDocument = playerDocsById.get(playerDocumentId)
      const playerSeason = findPlayerSeasonRow({
        playerDocument,
        teamId,
        seasonKey,
        leagueId: season.leagueId,
      })

      if (!playerSeason) {
        findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
          entityType: 'player',
          documentId: playerDocumentId,
          relatedDocumentId: id,
          teamDocumentId: teamId,
          ...playerIdentity,
          seasonKey,
          title: 'למסמך השחקן חסרה עונה תואמת',
          explanation: 'לשחקן עם פרופיל בעונה זו חייבת להיות אותה קבוצה ועונה גם במסמך השחקן.',
        }))
      } else if (!sameProfiles(player, playerSeason)) {
        findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'player',
          documentId: playerDocumentId,
          relatedDocumentId: id,
          teamDocumentId: teamId,
          ...playerIdentity,
          seasonKey,
          title: 'מסמך השחקן אינו תואם לעונת הקבוצה',
          explanation: 'פרופיל הסקאוט של אותה עונה וקבוצה חסר או שונה במסמך השחקן.',
          source: 'Team Season player scout profile → Player Document',
          expected: { scoutProfileIds: normalizedProfilesOf(player) },
          actual: {
            ...playerAuditDetails({ player: playerDocument, rootsById }),
            leagueId: clean(season.leagueId),
            scoutProfileIds: normalizedProfilesOf(playerSeason),
          },
        }))
      }
    }
    const expectedIndexKey = playerIndexKey({
      ...player,
      ...season,
      birthTeamId: season.birthTeamId || root?.birthTeamId,
      birthTeamSlot: season.birthTeamSlot || root?.birthTeamSlot,
    })
    const playerIndex = expectedIndexKey
      ? playerIndexes.find(index => playerIndexKey(index.data) === expectedIndexKey)
      : null
    if (expectedIndexKey && !playerIndex) {
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
        entityType: 'playerSearchIndex',
        documentId: '',
        teamDocumentId: teamId,
        ...playerIdentity,
        seasonKey,
        title: 'חסר אינדקס שחקן',
        explanation: 'שחקן סגל עם זהות מלאה מחייב Player SearchIndex.',
      }))
    }
    if (playerIndex && !samePlayerSearchIndexProfiles(player, playerIndex.data)) findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
      entityType: 'playerSearchIndex',
      documentId: playerIndex.id,
      relatedDocumentId: id,
      teamDocumentId: teamId,
      ...playerIdentity,
      seasonKey,
      title: 'אינדקס השחקן אינו תואם לעונת הקבוצה',
      explanation: 'פרופיל הסקאוט של אותה עונה וקבוצה חסר או שונה באינדקס השחקן.',
      source: 'Team Season player scout profile → Player SearchIndex',
      repairType: AUDIT_REPAIR_TYPE.REBUILD_PLAYER_SEARCH_INDEX,
      expected: {
        scoutProfileIds: profileIdsOf(player.professionalScoutProfileIds),
        scoutPreliminaryProfileIds: profileIdsOf(player.preliminaryScoutProfileIds),
        primaryScoutProfileId: clean(player.primaryScoutProfileId),
      },
      actual: {
        leagueId: clean(season.leagueId),
        scoutProfileIds: profileIdsOf(playerIndex.data.scoutProfileIds),
        scoutPreliminaryProfileIds: profileIdsOf(playerIndex.data.scoutPreliminaryProfileIds),
        primaryScoutProfileId: clean(playerIndex.data.primaryScoutProfileId),
      },
    }))
    const calculatedTeamPlayer = buildTeamPlayerSeasonalScoutProjection({
      player: buildTeamPlayerScoutContext({ player, teamContext: teamScoutContext }),
      season: scoutSeason,
      team: teamScoutContext,
    })
    if (!sameProfiles(player, calculatedTeamPlayer)) findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
      entityType: 'teamSeasonPlayer',
      documentId: id,
      relatedDocumentId: playerDocumentId,
      teamDocumentId: teamId,
      ...playerIdentity,
      seasonKey,
      title: 'שחקן בעונת הקבוצה אינו תואם לחישוב הסקאוט',
      explanation: 'פרופיל הסקאוט השמור בשורת השחקן שונה מהחישוב על בסיס נתוני השחקן והקבוצה.',
      source: 'Player and Team Season data → Team Season player scout profile',
      expected: { scoutProfileIds: normalizedProfilesOf(calculatedTeamPlayer) },
      actual: {
        leagueId: clean(season.leagueId),
        scoutProfileIds: normalizedProfilesOf(player),
      },
    }))
  })
}

export function appendPlayerDocumentAuditFindings({
  players,
  scopedSeasons,
  lifecycle,
  helpers,
}) {
  const { clean, hasTracking } = helpers

  // A Player document may be retained as history or as a deliberate manual
  // record.  Its existence alone is not a data-integrity failure.
  players.forEach(({ id, data }) => {
    const appearsInRoster = scopedSeasons.some(season => (season.data.teamPlayers || []).some(player => clean(player.playerDocumentId) === id))
    if (!appearsInRoster && hasTracking(data)) {
      lifecycle.push({
        entityType: 'player',
        documentId: id,
        playerDocumentId: id,
        seasonKey: '',
        status: 'tracked_outside_current_roster',
      })
    }
  })
}
