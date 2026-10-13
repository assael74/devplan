// src/features/playersDatabase/ui/pages/teamPage/roster/import/logic/rosterImportSummary.model.js

const values = value => Object.values(value || {})
const list = value => Array.isArray(value) ? value : []

export const buildRosterImportSummary = ({ plan, rows, missingPlayers, teamOptions }) => {
  const season = plan?.canonical?.teamSeason
  const players = values(season?.roster?.playersById)
  const pendingPlayers = values(season?.roster?.pendingById)
  const incoming = values(season?.movement?.transfersInById)
  const outgoing = values(season?.movement?.transfersOutById)
  const namesById = new Map([
    ...list(rows), ...list(missingPlayers), ...pendingPlayers, ...players,
  ].map(player => [player.playerId, player.fullName || player.displayName || player.name || player.playerId]))
  const counterpartWrites = new Map(list(plan?.counterparts).map(write => [write.documentId, write]))
  const movementRows = (facts, direction) => facts.map(fact => {
    const documentId = direction === 'in' ? fact.fromTeamSeasonDocumentId : fact.toTeamSeasonDocumentId
    const teamId = direction === 'in' ? fact.fromTeamId : fact.toTeamId
    const team = list(teamOptions).find(option => (
      (option.teamId || option.birthTeamDocumentId || option.birthTeamId) === teamId
    ))
    const write = counterpartWrites.get(documentId)
    const side = direction === 'in' ? 'transfersOutById' : 'transfersInById'
    return {
      movementId: fact.movementId,
      playerId: fact.playerId,
      playerName: namesById.get(fact.playerId) || fact.playerId,
      teamName: team?.teamName || team?.label || teamId,
      direction,
      exists: Boolean(write?.movement?.[side]?.[fact.movementId]),
    }
  })
  const balance = season?.stats?.teamBalance

  return {
    players,
    pendingPlayers,
    counterparts: [...movementRows(incoming, 'in'), ...movementRows(outgoing, 'out')],
    preview: {
      playersCount: players.filter(player => (player.rosterStatus || 'regular') === 'regular').length,
      transfersInCount: incoming.length,
      transfersOutCount: outgoing.length,
      pendingPlayersCount: pendingPlayers.length,
      teamBalance: balance?.lineStructure ? balance : null,
    },
  }
}
