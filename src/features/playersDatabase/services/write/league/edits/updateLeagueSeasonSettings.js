// src/features/playersDatabase/services/write/league/edits/updateLeagueSeasonSettings.js

import { buildTeamCompetitionProjection } from '../../../../domain/league/clubsCenterTeam.builder.js'
import { validateLeagueCompetitionRules } from '../../../../domain/league/competitionRules.validator.js'
import { clean, equal, requireValue, urlValue } from '../../../../domain/edits/editIdentity.js'
import {
  executeManualEdit,
  manualEditRef,
  requireManualEditDocument,
} from '../../shared/manualEdit.write.js'

export const updateLeagueSeasonSettings = async input => {
  const hasUrl = Object.prototype.hasOwnProperty.call(input, 'seasonUrl')
  const hasRules = Object.prototype.hasOwnProperty.call(input, 'competitionRules')
  requireValue(hasUrl || hasRules, 'לא נבחר שדה לעדכון')
  const league = requireValue(clean(input.leagueId), 'מזהה ליגה חסר')
  const season = requireValue(clean(input.seasonId), 'מזהה עונה טכני חסר')
  const url = hasUrl ? urlValue(input.seasonUrl) : ''
  const rules = hasRules ? validateLeagueCompetitionRules(input.competitionRules) : null
  const leagueRef = manualEditRef('leagues', league)
  const centerRef = manualEditRef('leaguesCenter', 'all')
  const clubsCenterRef = hasRules ? manualEditRef('clubsCenter', season) : null

  return executeManualEdit({
    refreshSignals: hasRules,
    getSignalRefresh: hasRules ? ({ get }) => {
      const leagueDocument = requireManualEditDocument(get(leagueRef))
      const leagueSeason = leagueDocument.seasonsById[season]
      const birthYear = Number(leagueSeason.birthYear)
      requireValue(Number.isInteger(birthYear) && birthYear > 0, 'שנתון עונת הליגה חסר')
      return {
        clubIds: [...new Set(Object.values(leagueSeason.table?.teamsById || {}).map(team => (
          requireValue(clean(team.clubId), 'שיוך המועדון חסר')
        )))],
        scope: { seasonId: season, birthYear: birthYear + 1 },
      }
    } : null,
    refs: [leagueRef, centerRef, ...(hasRules ? [clubsCenterRef] : [])],
    build: ({ get, updatedAt }) => {
      const leagueDocument = requireManualEditDocument(get(leagueRef))
      const center = requireManualEditDocument(get(centerRef))
      requireValue(clean(leagueDocument.leagueId) === league, 'זהות הליגה סותרת')
      const leagueSeason = leagueDocument.seasonsById?.[season]
      const centerSeason = center.leaguesById?.[league]?.seasonsById?.[season]
      requireValue(Boolean(leagueSeason), 'עונת הליגה חסרה')
      requireValue(Boolean(centerSeason), 'עונת הליגה חסרה במרכז הליגות')
      const changes = []
      const leaguePatch = {}
      const centerPatch = {}
      const rulesChanged = hasRules && !equal(leagueSeason.competitionRules, rules)

      if (hasUrl && clean(leagueSeason.seasonUrl) !== url) {
        leaguePatch[`seasonsById.${season}.seasonUrl`] = url
      }
      if (hasUrl && clean(centerSeason.seasonUrl) !== url) {
        centerPatch[`leaguesById.${league}.seasonsById.${season}.seasonUrl`] = url
      }
      if (rulesChanged) {
        // Update only changed rule fields; the official table and other season data stay untouched.
        if (leagueSeason.competitionRules?.configured !== rules.configured) {
          leaguePatch[`seasonsById.${season}.competitionRules.configured`] = rules.configured
        }
        for (const zone of ['promotion', 'relegation']) {
          for (const [key, value] of Object.entries(rules[zone])) {
            if (!equal(leagueSeason.competitionRules?.[zone]?.[key], value)) {
              leaguePatch[`seasonsById.${season}.competitionRules.${zone}.${key}`] = value
            }
          }
        }
        if (centerSeason.hasCompetitionRules !== Boolean(rules.configured)) {
          centerPatch[`leaguesById.${league}.seasonsById.${season}.hasCompetitionRules`] = Boolean(rules.configured)
        }
        const clubsCenter = requireManualEditDocument(get(clubsCenterRef))
        const clubsPatch = {}
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
          if (!equal(previous.competitionProjection, competitionProjection)) {
            clubsPatch[`clubsById.${clubId}.teamsById.${teamId}.competitionProjection`] = competitionProjection
            clubsPatch[`clubsById.${clubId}.teamsById.${teamId}.updatedAt`] = updatedAt
          }
        })
        if (Object.keys(clubsPatch).length) changes.push({ ref: clubsCenterRef, patch: clubsPatch })
      }
      if (Object.keys(leaguePatch).length) {
        leaguePatch[`seasonsById.${season}.updatedAt`] = updatedAt
        changes.push({ ref: leagueRef, patch: leaguePatch })
      }
      if (Object.keys(centerPatch).length) {
        centerPatch[`leaguesById.${league}.seasonsById.${season}.updatedAt`] = updatedAt
        changes.push({ ref: centerRef, patch: centerPatch })
      }
      return changes
    },
  })
}
