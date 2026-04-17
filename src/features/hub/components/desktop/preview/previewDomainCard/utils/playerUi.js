// src/features/players/components/desktop/preview/PreviewDomainCard/utils/playerUi.js

export const resolvePlayerUi = (entity) => {
  const ui = entity?.ui || {}
  const playerPhoto = entity?.photo || entity?.club?.photo || ''
  const fullName = ui?.fullName || [entity?.playerFirstName, entity?.playerLastName].filter(Boolean).join(' ') || 'שחקן'
  const birthYearText = ui?.birthYear ? ` • שנתון ${ui.birthYear}` : ''
  return { ui, playerPhoto, fullName, birthYearText }
}
