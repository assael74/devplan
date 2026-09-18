import { buildTeamPlayerSeasonalScoutProjection } from '../audit.projections.js'
import { buildAuditFinding, AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE } from '../audit.contract.js'

export function appendPlayerSeasonAuditFindings({
  id,
  season,
  teamId,
  seasonKey,
  root,
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
  } = helpers

  ;(Array.isArray(season.teamPlayers) ? season.teamPlayers : []).forEach(player => {
    const playerDocumentId = clean(player.playerDocumentId)
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
        playerDocumentId,
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
          playerDocumentId,
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
          playerDocumentId,
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
        playerDocumentId,
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
      playerDocumentId,
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
      player,
      season: {
        seasonId: season.seasonId || seasonKey,
        seasonKey,
        seasonStatus: season.seasonStatus,
        leagueId: season.leagueId,
      },
      team: { ...(root || {}), ...season },
    })
    if (!sameProfiles(player, calculatedTeamPlayer)) findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
      entityType: 'teamSeasonPlayer',
      documentId: id,
      relatedDocumentId: playerDocumentId,
      teamDocumentId: teamId,
      playerDocumentId,
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
  favoriteIds,
  rootsById,
  scopedSeasons,
  findings,
  lifecycle,
  helpers,
}) {
  const { clean, hasTracking, playerAuditDetails } = helpers

  players.forEach(({ id, data }) => {
    const favorite = favoriteIds.has(clean(data.playerId))
    // A non-current season participant can retain a Player document purely as an
    // archive of prior seasons.  It is not an active tracking document and
    // must not be reported as an unexpected document after its current
    // season's scout profile is cleared.
    const hasArchivedSeasonHistory = (
      (Array.isArray(data.history) && data.history.length > 0) ||
      (Array.isArray(data.current) && data.current.length > 1)
    )
    const retainedForOutOfRosterScope = hasArchivedSeasonHistory && scopedSeasons.some(season => (
      (Array.isArray(season.data?.teamPlayers) ? season.data.teamPlayers : [])
        .some(player => (
          clean(player.playerDocumentId) === id &&
          clean(player.rosterStatus || 'regular') !== 'regular'
        ))
    ))
    if (!hasTracking(data) && !favorite && !retainedForOutOfRosterScope) {
      const details = playerAuditDetails({ player: data, rootsById })
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT,
        entityType: 'player',
        documentId: id,
        playerDocumentId: id,
        title: 'מסמך שחקן ללא סיבת מעקב',
        explanation: 'אין פרופיל סקאוט, Favorite, Watchlist או סיבת מעקב אחרת.',
        actual: details,
      }))
    }
  })
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
