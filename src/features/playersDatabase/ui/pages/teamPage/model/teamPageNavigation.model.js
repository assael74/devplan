// src/features/playersDatabase/ui/pages/teamPage/model/teamPageNavigation.model.js

import { buildLeaguePageTeams } from '../../../../model/league/page/leaguePage.model.js'

const cleanKey = value => String(value || '').trim()

const buildTeamNavigationLabel = teamRow => [
  teamRow.tableRank ? `מקום ${teamRow.tableRank}` : '',
  teamRow.teamSlot && teamRow.teamSlot > 1 ? `קבוצה ${teamRow.teamSlot}` : '',
  teamRow.hasStats ? 'סטטיסטיקה' : teamRow.hasPlayers ? 'סגל' : 'ללא סגל',
].filter(Boolean).join(' · ')

export const buildTeamPageLeagueNavigation = ({
  selectedLeagueSeason,
  leagueDoc,
  selectedSeasonOption,
  team,
}) => {
  const rows = buildLeaguePageTeams({
    season: selectedLeagueSeason?.season,
    leagueDoc,
    target: selectedSeasonOption?.target || 'current',
  })
  const options = rows
    .map(teamRow => ({
      value: cleanKey(teamRow.id || teamRow.teamDocumentId || teamRow.birthTeamId),
      label: teamRow.name,
      secondaryLabel: buildTeamNavigationLabel(teamRow),
      keys: [
        teamRow.id,
        teamRow.teamId,
        teamRow.birthTeamId,
        teamRow.teamDocumentId,
      ].map(cleanKey).filter(Boolean),
    }))
    .filter(option => option.value)
  const currentKeys = new Set([
    team.id,
    team.teamId,
    team.birthTeamId,
    team.teamDocumentId,
  ].map(cleanKey).filter(Boolean))
  const currentIndex = options.findIndex(option => (
    option.keys.some(key => currentKeys.has(key))
  ))

  return {
    options,
    value: currentIndex >= 0 ? options[currentIndex].value : '',
    previousValue: currentIndex > 0 ? options[currentIndex - 1].value : '',
    nextValue: currentIndex >= 0 && currentIndex < options.length - 1
      ? options[currentIndex + 1].value
      : '',
  }
}
