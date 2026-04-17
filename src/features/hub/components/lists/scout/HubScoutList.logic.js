// src/features/hub/components/lists/scout/HubScoutingList.logic.js

import playerImage from '../../../../../ui/core/images/playerImage.jpg'

export function buildScoutingTitle(row) {
  return row?.playerName || 'שחקן למעקב'
}

export function buildScoutingSubline(row) {
  const clubName = row?.clubName || ''
  const teamName = row?.teamName || ''

  return [clubName, teamName].filter(Boolean).join(' • ')
}

export function buildScoutingRowVm(row) {
  return {
    ...row,
    title: buildScoutingTitle(row),
    photo: row?.photo || playerImage,
    idIcon: 'scouting',
    subline: buildScoutingSubline(row),
  }
}
