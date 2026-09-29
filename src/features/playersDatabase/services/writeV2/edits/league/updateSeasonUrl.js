// src/features/playersDatabase/services/writeV2/edits/league/updateSeasonUrl.js

import { data, executeEdit, read, reference } from '../shared/executeEdit.js'
import {
  assertLeague,
  readTeamIndexes,
  resolveTeamSeasonRef,
  teamTargets,
} from '../shared/validation.js'
import {
  array,
  clean,
  findSeason,
  leagueSeasonPatch,
  requireValue,
  seasonKey,
  teamId,
  unique,
  urlValue,
} from '../../../../domain/edits/editIdentity.js'

export async function updateLeagueSeasonUrl({
  leagueId,
  seasonKey: suppliedKey,
  seasonUrl,
}) {
  const id = requireValue(clean(leagueId), 'מזהה ליגה חסר')
  const key = seasonKey({ seasonKey: suppliedKey })
  const url = urlValue(seasonUrl)
  const leagueRef = reference('leagues', id)
  const masterRef = reference('leaguesMaster', 'all')
  const initial = findSeason(assertLeague(data(await read(leagueRef)), id), key).row
  const teams = await Promise.all(
    array(initial.tableRank || [], 'טבלת ליגה').map(async row => {
      const indexes = await readTeamIndexes(teamId(row), key)
      const { ref: seasonRef, documentId } = resolveTeamSeasonRef(
        indexes,
        '',
        key,
      )
      return {
        id: teamId(row),
        documentId,
        seasonRef,
        indexes,
      }
    }),
  )
  return executeEdit({
    refs: [
      leagueRef,
      masterRef,
      ...teams.flatMap(team => [team.seasonRef, ...team.indexes.map(item => item.ref)]),
    ],
    build: (get, updatedAt) => {
      const league = assertLeague(data(get(leagueRef)), id)
      const selected = findSeason(league, key)
      const rows = array(selected.row.tableRank || [], 'טבלת ליגה')
      const changes = []
      rows.forEach(row => {
        const team = unique(
          teams,
          item => item.id === teamId(row),
          'קבוצה בעונה',
        )
        unique(rows, item => teamId(item) === team.id, 'קבוצה בליגה')
        const targets = teamTargets({ ...team, get, row, key, leagueId: id })
        ;[targets.index, ...targets.players].forEach(item =>
          changes.push({ ref: item.ref, patch: { seasonUrl: url } }),
        )
      })
      const master = data(get(masterRef))
      const leagues = array(master.leagues, 'מאסטר ליגות')
      const entry = unique(leagues, row => clean(row.leagueId) === id, 'ליגה במאסטר')
      const entrySeason = unique(
        array(entry.seasons, 'עונות במאסטר'),
        row => seasonKey(row) === key,
        'עונה במאסטר',
      )
      requireValue(
        entry.leagueDocumentId === id && entrySeason.leagueDocumentId === id,
        'הפניית ליגה במאסטר סותרת',
      )
      if (entrySeason.leagueUrl !== url)
        changes.push({
          ref: masterRef,
          patch: {
            leagues: leagues.map(row =>
              row === entry
                ? {
                    ...row,
                    updatedAt,
                    seasons: row.seasons.map(value =>
                      value === entrySeason
                        ? { ...value, leagueUrl: url, updatedAt }
                        : value,
                    ),
                  }
                : row,
            ),
          },
        })
      if (selected.row.seasonUrl !== url)
        changes.push({
          ref: leagueRef,
          patch: leagueSeasonPatch(league, selected, { seasonUrl: url, updatedAt }),
        })
      return changes
    },
  })
}
