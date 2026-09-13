import { buildAuditFinding, AUDIT_FINDING_TYPE } from '../audit.contract.js'

export function appendSearchIndexAuditFindings({
  leagues,
  teamSeasons,
  teamIndexes,
  playerIndexes,
  rootsById,
  findings,
  helpers,
}) {
  const { clean, teamIdOf, seasonKeyOf, playerIndexKey, findLeagueTableTeamContext } = helpers

  teamIndexes
    .filter(row => clean(row.data.teamSeasonDocumentId))
    .forEach(row => {
      if (!teamSeasons.some(season => season.id === clean(row.data.teamSeasonDocumentId))) {
        findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
          entityType: 'teamSearchIndex',
          documentId: row.id,
          relatedDocumentId: row.data.teamSeasonDocumentId,
          teamDocumentId: teamIdOf(row.data),
          seasonKey: seasonKeyOf(row.data),
          title: 'אינדקס קבוצה מצביע לעונה שאינה קיימת',
        }))
      }
    })
  playerIndexes.forEach(index => {
    const indexKey = playerIndexKey(index.data)
    const owner = teamSeasons.find(season => (
      (Array.isArray(season.data.teamPlayers) ? season.data.teamPlayers : []).some(player => (
        playerIndexKey({
          ...player,
          ...season.data,
          birthTeamId: season.data.birthTeamId || rootsById.get(teamIdOf(season.data))?.birthTeamId,
          birthTeamSlot: season.data.birthTeamSlot || rootsById.get(teamIdOf(season.data))?.birthTeamSlot,
        }) === indexKey
      ))
    ))
    if (!owner) {
      const teamId = teamIdOf(index.data)
      const seasonKey = seasonKeyOf(index.data)
      const root = rootsById.get(teamId) || {}
      const leagueContext = findLeagueTableTeamContext({ leagues, teamId, seasonKey }) || {}
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT,
        entityType: 'playerSearchIndex',
        documentId: index.id,
        teamDocumentId: teamId,
        teamDisplayName: clean(
        index.data?.teamDisplayName || index.data?.teamName ||
        root?.displayName || root?.teamName || leagueContext?.teamDisplayName
      ),
        leagueId: clean(index.data?.leagueId || leagueContext?.leagueId),
        playerDocumentId: clean(index.data?.playerDocumentId),
        playerId: clean(index.data?.playerId),
        externalPlayerId: clean(index.data?.externalPlayerId),
        playerDisplayName: clean(index.data?.displayName || index.data?.normalizedDisplayName),
        seasonKey,
        title: 'אינדקס שחקן ללא שחקן סגל',
        explanation: 'אין Team Season עם שחקן תואם לאינדקס הזה.',
      }))
    }
  })
}
