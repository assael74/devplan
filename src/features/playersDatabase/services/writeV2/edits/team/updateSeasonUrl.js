// src/features/playersDatabase/services/writeV2/edits/team/updateSeasonUrl.js

import { data, executeEdit, reference } from '../shared/executeEdit.js'
import {
  assertLeague,
  resolveTeamSeasonRef,
  readTeamIndexes,
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

export async function updateTeamSeasonUrl({
  leagueId,
  birthTeamId,
  birthTeamDocumentId,
  seasonKey: suppliedKey,
  teamUrl,
}) {
  const id = requireValue(clean(birthTeamId), 'מזהה קבוצת שנתון חסר')
  const documentId = requireValue(
    clean(birthTeamDocumentId),
    'מזהה מסמך קבוצת שנתון חסר',
  )
  const league = requireValue(clean(leagueId), 'מזהה ליגה חסר')
  const key = seasonKey({ seasonKey: suppliedKey })
  const url = urlValue(teamUrl)
  const leagueRef = reference('leagues', league)
  const indexes = await readTeamIndexes(id, key)
  const { ref: seasonRef } = resolveTeamSeasonRef(indexes, documentId, key)
  return executeEdit({
    refs: [leagueRef, seasonRef, ...indexes.map(item => item.ref)],
    build: (get, updatedAt) => {
      const document = assertLeague(data(get(leagueRef)), league)
      const selected = findSeason(document, key)
      const rows = array(selected.row.tableRank, 'טבלת ליגה')
      const row = unique(
        rows,
        item => teamId(item) === id,
        'קבוצה בליגה',
      )
      const targets = teamTargets({
        get,
        seasonRef,
        indexes,
        row,
        id,
        documentId,
        key,
        leagueId: league,
      })
      const changes = [targets.index, ...targets.players].map(item => ({
        ref: item.ref,
        patch: { teamUrl: url },
      }))
      if (targets.season) changes.push({ ref: seasonRef, patch: { teamUrl: url } })
      if (row.teamUrl !== url)
        changes.push({
          ref: leagueRef,
          patch: leagueSeasonPatch(document, selected, {
            tableRank: rows.map(item =>
              item === row ? { ...item, teamUrl: url, updatedAt } : item,
            ),
            updatedAt,
          }),
        })
      return changes
    },
  })
}
