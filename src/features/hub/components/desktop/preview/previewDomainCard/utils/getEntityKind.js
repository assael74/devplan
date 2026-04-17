// src/features/players/components/desktop/preview/PreviewDomainCard/utils/getEntityKind.js

export const getEntityKind = (entity) => {
  const e = entity || {}

  // player signals
  if (e.positions || e.playerFullStats || e.playerGames || e.birth) return 'player'

  // team signals
  if (e.teamFullStats || e.abilitiesTeam || e.teamGames) return 'team'

  return 'club'
}
