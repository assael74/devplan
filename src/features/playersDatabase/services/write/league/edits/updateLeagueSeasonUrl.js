// src/features/playersDatabase/services/write/league/edits/updateLeagueSeasonUrl.js

import { clean, requireValue, urlValue } from '../../../../domain/edits/editIdentity.js'
import {
  executeManualEdit,
  manualEditRef,
  readManualEditRefs,
  requireManualEditDocument,
} from '../../shared/manualEdit.write.js'

export const updateLeagueSeasonUrl = async ({ leagueId, seasonId, seasonUrl }) => {
  const league = requireValue(clean(leagueId), 'מזהה ליגה חסר')
  const season = requireValue(clean(seasonId), 'מזהה עונה טכני חסר')
  const url = urlValue(seasonUrl)
  const leagueRef = manualEditRef('leagues', league)
  const centerRef = manualEditRef('leaguesCenter', 'all')
  const indexRefs = await readManualEditRefs('playerSearchIndexes', {
    leagueId: league,
    seasonId: season,
  })

  return executeManualEdit({
    refs: [leagueRef, centerRef, ...indexRefs],
    build: ({ get, updatedAt }) => {
      const leagueDocument = requireManualEditDocument(get(leagueRef))
      const center = requireManualEditDocument(get(centerRef))
      requireValue(clean(leagueDocument.leagueId) === league, 'זהות הליגה סותרת')
      const leagueSeason = leagueDocument.seasonsById?.[season]
      const centerSeason = center.leaguesById?.[league]?.seasonsById?.[season]
      requireValue(Boolean(leagueSeason), 'עונת הליגה חסרה')
      requireValue(Boolean(centerSeason), 'עונת הליגה חסרה במרכז הליגות')
      const changes = []
      if (clean(leagueSeason.seasonUrl) !== url) {
        changes.push({
          ref: leagueRef,
          patch: {
            [`seasonsById.${season}`]: { ...leagueSeason, seasonUrl: url, updatedAt },
          },
        })
      }
      if (clean(centerSeason.seasonUrl) !== url) {
        changes.push({
          ref: centerRef,
          patch: {
            [`leaguesById.${league}.seasonsById.${season}`]: {
              ...centerSeason,
              seasonUrl: url,
              updatedAt,
            },
          },
        })
      }
      indexRefs.forEach(indexRef => {
        const index = requireManualEditDocument(get(indexRef))
        requireValue(
          clean(index.leagueId) === league && clean(index.seasonId) === season,
          'זהות תוצר החיפוש סותרת',
        )
        if (clean(index.team?.seasonUrl) !== url) {
          changes.push({
            ref: indexRef,
            patch: { team: { ...(index.team || {}), seasonUrl: url } },
          })
        }
      })
      return changes
    },
  })
}
