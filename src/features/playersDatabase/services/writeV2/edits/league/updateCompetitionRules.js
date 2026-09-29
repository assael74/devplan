// src/features/playersDatabase/services/writeV2/edits/league/updateCompetitionRules.js

import { data, executeEdit, read, reference } from '../shared/executeEdit.js'
import { assertLeague } from '../shared/validation.js'
import {
  array,
  clean,
  equal,
  findSeason,
  leagueSeasonPatch,
  requireValue,
  seasonKey,
  unique,
} from '../../../../domain/edits/editIdentity.js'
import {
  buildLeagueRulesClubChanges,
  validateRules,
} from '../../../../domain/edits/leagueRulesChanges.js'
import { normalizeCompetitionRules } from '../../../../domain/projections/club/clubCompetition.projection.js'

export async function updateLeagueCompetitionRules({
  leagueId,
  seasonKey: suppliedKey,
  competitionRules,
}) {
  const id = requireValue(clean(leagueId), 'מזהה ליגה חסר')
  const key = seasonKey({ seasonKey: suppliedKey })
  const rules = validateRules(competitionRules)
  const leagueRef = reference('leagues', id)
  const initialLeague = assertLeague(data(await read(leagueRef)), id)
  const initialSeason = findSeason(initialLeague, key).row
  const rulesChanged = !equal(
    normalizeCompetitionRules(initialSeason.competitionRules),
    rules,
  )
  const clubIds = rulesChanged
    ? [
        ...new Set(
          array(initialSeason.tableRank || [], 'טבלת הליגה').map(row =>
            requireValue(clean(row.clubId), 'שיוך מועדון חסר'),
          ),
        ),
      ]
    : []
  const clubRefs = clubIds.map(clubId => reference('clubs', clubId))
  const clubsMasterRef = clubIds.length ? reference('clubsMaster', 'all') : null
  return executeEdit({
    refs: [leagueRef, ...clubRefs, ...(clubsMasterRef ? [clubsMasterRef] : [])],
    build: (get, updatedAt) => {
      const league = assertLeague(data(get(leagueRef)), id)
      const selected = findSeason(league, key)
      const changes = []
      const patch = {}
      if (!equal(normalizeCompetitionRules(selected.row.competitionRules), rules)) {
        patch.competitionRules = rules
        const master = clubsMasterRef ? data(get(clubsMasterRef)) : null
        let clubs = master ? array(master.clubs, 'מאסטר מועדונים') : []
        clubRefs.forEach(ref => {
          const club = data(get(ref))
          requireValue(clean(club.clubId) === ref.id, 'זהות מועדון סותרת')
          const entry = unique(
            clubs,
            row => clean(row.clubId) === ref.id,
            'מועדון במאסטר',
          )
          const projected = buildLeagueRulesClubChanges({
            club,
            masterEntry: entry,
            league,
            season: selected.row,
            rules,
            updatedAt,
          })
          changes.push({ ref, patch: { competitionPaths: projected.competitionPaths } })
          clubs = clubs.map(row =>
            row === entry
              ? equal(row.competitionPaths, projected.masterCompetitionPaths)
                ? row
                : {
                    ...row,
                    competitionPaths: projected.masterCompetitionPaths,
                    updatedAt,
                  }
              : row,
          )
        })
        if (master) changes.push({ ref: clubsMasterRef, patch: { clubs } })
      }
      if (Object.keys(patch).length) {
        changes.push({
          ref: leagueRef,
          patch: leagueSeasonPatch(league, selected, {
            ...patch,
            updatedAt,
          }),
        })
      }
      return changes
    },
  })
}
