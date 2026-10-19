// src/features/playersDatabase/services/write/league/edits/updateTeamSeasonUrl.js

import { clean, requireValue, urlValue } from '../../../../domain/edits/editIdentity.js'
import { buildTeamSeasonDocumentId } from '../../../../domain/identity/index.js'
import {
  executeManualEdit,
  manualEditRef,
  requireManualEditDocument,
} from '../../shared/manualEdit.write.js'

export const updateTeamSeasonUrl = async ({
  leagueId,
  teamId,
  teamSeasonDocumentId,
  seasonId,
  teamUrl,
}) => {
  const league = requireValue(clean(leagueId), 'מזהה ליגה חסר')
  const team = requireValue(clean(teamId), 'מזהה קבוצה חסר')
  const season = requireValue(clean(seasonId), 'מזהה עונה טכני חסר')
  const teamSeasonId = requireValue(clean(teamSeasonDocumentId), 'מזהה עונת קבוצה חסר')
  requireValue(
    teamSeasonId === buildTeamSeasonDocumentId({ teamId: team, seasonId: season }),
    'מזהה עונת הקבוצה סותר את הקבוצה והעונה',
  )
  const url = urlValue(teamUrl)
  const leagueRef = manualEditRef('leagues', league)
  const teamSeasonRef = manualEditRef('teamSeasons', teamSeasonId)

  return executeManualEdit({
    refs: [leagueRef, teamSeasonRef],
    build: ({ get, updatedAt }) => {
      const leagueDocument = requireManualEditDocument(get(leagueRef))
      requireValue(clean(leagueDocument.leagueId) === league, 'זהות הליגה סותרת')
      const leagueSeason = leagueDocument.seasonsById?.[season]
      const leagueTeam = leagueSeason?.table?.teamsById?.[team]
      requireValue(Boolean(leagueTeam), 'הקבוצה חסרה בעונת הליגה')
      const changes = []
      if (clean(leagueTeam.teamUrl) !== url) {
        changes.push({
          ref: leagueRef,
          patch: {
            [`seasonsById.${season}.table.teamsById.${team}`]: {
              ...leagueTeam,
              teamUrl: url,
              updatedAt,
            },
          },
        })
      }
      const teamSeasonSnapshot = get(teamSeasonRef)
      if (teamSeasonSnapshot.exists()) {
        const teamSeason = teamSeasonSnapshot.data()
        requireValue(
          clean(teamSeason.identity?.teamSeasonDocumentId) === teamSeasonId &&
            clean(teamSeason.identity?.teamId) === team &&
            clean(teamSeason.identity?.seasonId) === season &&
            clean(teamSeason.identity?.leagueId) === league,
          'זהות עונת הקבוצה סותרת',
        )
        if (clean(teamSeason.competitionSnapshot?.teamUrl) !== url) {
          changes.push({
            ref: teamSeasonRef,
            patch: {
              competitionSnapshot: {
                ...(teamSeason.competitionSnapshot || {}),
                teamUrl: url,
                updatedAt,
              },
            },
          })
        }
      }
      return changes
    },
  })
}
