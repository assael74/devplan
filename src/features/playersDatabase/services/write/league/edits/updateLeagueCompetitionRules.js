// src/features/playersDatabase/services/write/league/edits/updateLeagueCompetitionRules.js

import { buildTeamCompetitionProjection } from '../../../../domain/league/clubsCenterTeam.builder.js'
import { validateLeagueCompetitionRules } from '../../../../domain/league/competitionRules.validator.js'
import { clean, equal, requireValue } from '../../../../domain/edits/editIdentity.js'
import {
  executeManualEdit,
  manualEditRef,
  requireManualEditDocument,
} from '../../shared/manualEdit.write.js'

export const updateLeagueCompetitionRules = ({
  leagueId,
  seasonId,
  competitionRules,
}) => {
  const league = requireValue(clean(leagueId), 'מזהה ליגה חסר')
  const season = requireValue(clean(seasonId), 'מזהה עונה טכני חסר')
  const rules = validateLeagueCompetitionRules(competitionRules)
  const leagueRef = manualEditRef('leagues', league)
  const centerRef = manualEditRef('leaguesCenter', 'all')
  const clubsCenterRef = manualEditRef('clubsCenter', season)

  return executeManualEdit({
    refs: [leagueRef, centerRef, clubsCenterRef],
    build: ({ get, updatedAt }) => {
      const leagueDocument = requireManualEditDocument(get(leagueRef))
      const leaguesCenter = requireManualEditDocument(get(centerRef))
      const clubsCenter = requireManualEditDocument(get(clubsCenterRef))
      requireValue(clean(leagueDocument.leagueId) === league, 'זהות הליגה סותרת')
      const leagueSeason = leagueDocument.seasonsById?.[season]
      const centerSeason = leaguesCenter.leaguesById?.[league]?.seasonsById?.[season]
      requireValue(Boolean(leagueSeason), 'עונת הליגה חסרה')
      requireValue(Boolean(centerSeason), 'עונת הליגה חסרה במרכז הליגות')
      if (equal(leagueSeason.competitionRules, rules)) return []

      const changes = [
        {
          ref: leagueRef,
          patch: {
            [`seasonsById.${season}`]: {
              ...leagueSeason,
              competitionRules: rules,
              updatedAt,
            },
          },
        },
        {
          ref: centerRef,
          patch: {
            [`leaguesById.${league}.seasonsById.${season}`]: {
              ...centerSeason,
              hasCompetitionRules: Boolean(rules.configured),
              updatedAt,
            },
          },
        },
      ]

      Object.entries(leagueSeason.table?.teamsById || {}).forEach(([teamId, teamRow]) => {
        const clubId = requireValue(clean(teamRow.clubId), 'שיוך המועדון חסר')
        const previous = clubsCenter.clubsById?.[clubId]?.teamsById?.[teamId]
        requireValue(Boolean(previous), 'הקבוצה חסרה במרכז המועדונים')
        const competitionProjection = buildTeamCompetitionProjection({
          league: leagueDocument,
          season: { ...leagueSeason, competitionRules: rules },
          teamId,
          teamRow,
        })
        changes.push({
          ref: clubsCenterRef,
          patch: {
            [`clubsById.${clubId}.teamsById.${teamId}`]: {
              ...previous,
              competitionProjection,
              updatedAt,
            },
          },
        })
      })
      return changes
    },
  })
}
