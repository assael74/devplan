// src/features/playersDatabase/domain/edits/leagueRulesChanges.js

import {
  buildCompetitionProjection,
  buildEffectiveCompetitionProjection,
  normalizeCompetitionRules,
} from '../projections/club/clubCompetition.projection.js'
import { buildNextCompetitionPath } from '../projections/club/clubCompetitionPath.projection.js'
import { buildClubsMasterCompetitionPathEntry } from '../projections/club/clubsMaster.projection.js'
import {
  array,
  clean,
  equal,
  requireValue,
  seasonKey,
  teamId,
  unique,
} from './editIdentity.js'

export const validateRules = rules => {
  requireValue(rules && typeof rules === 'object', 'חוקי תחרות חסרים')
  for (const zone of ['promotion', 'relegation']) {
    for (const kind of ['directPlaces', 'playoffPlaces']) {
      const places = array(rules[zone]?.[kind], 'מיקומי תחרות')
      requireValue(
        places.every(value => Number.isInteger(value) && value > 0),
        'מיקומי תחרות אינם תקינים',
      )
    }
  }
  return normalizeCompetitionRules(rules)
}

// Only competitionProjection and its explicit downstream next path are owned here.
export const buildLeagueRulesClubChanges = ({
  club,
  masterEntry,
  league,
  season,
  rules,
  updatedAt,
}) => {
  const rows = array(season.tableRank || [], 'טבלת ליגה')
  const targets = rows.filter(row => clean(row.clubId) === clean(club.clubId))
  const originalPaths = array(club.competitionPaths, 'מסלולי המועדון')
  let paths = originalPaths
  const changedYears = new Set()
  for (const row of targets) {
    const path = unique(
      paths,
      item => Number(item.birthYear) === Number(season.birthYear),
      'מסלול שנתון',
    )
    const selected = unique(
      array(path.seasons, 'עונות מסלול'),
      item =>
        seasonKey(item) === seasonKey(season) &&
        clean(item.teamId) === teamId(row) &&
        clean(item.leagueId) === clean(league.id),
      'עונת מסלול',
    )
    const automatic = buildCompetitionProjection({
      rows,
      targetTeam: row,
      leagueLevel: league.level,
      competitionRules: rules,
    })
    const previous = selected.competitionProjection || {}
    const effective = buildEffectiveCompetitionProjection({
      automaticProjection: automatic,
      manualProjection: previous.manual,
      seasonStatus: selected.seasonStatus,
    })
    const projection = { ...previous, automatic, effective }
    if (!equal(previous, projection)) {
      paths = paths.map(item =>
        item === path
          ? {
              ...item,
              updatedAt,
              seasons: item.seasons.map(value =>
                value === selected
                  ? {
                      ...value,
                      competitionProjection: projection,
                      updatedAt,
                    }
                  : value,
              ),
            }
          : item,
      )
      changedYears.add(Number(path.birthYear))
    }
    const next = unique(
      paths,
      item => Number(item.birthYear) === Number(path.birthYear) + 1,
      'מסלול השנתון הבא',
    )
    const source = next.nextCompetitionPath
    if (!source || clean(source.sourceTeamId) !== teamId(row)) continue
    // The persisted next path has no source season key. Never guess its owner.
    const sourceSeasons = path.seasons.filter(item => clean(item.teamId) === teamId(row))
    requireValue(
      sourceSeasons.length === 1,
      'לא ניתן לזהות את עונת המקור של תחזית השנתון הבא; לא בוצעה שמירה',
    )
    const nextProjection = {
      ...source,
      ...buildNextCompetitionPath({
        sourceBirthYear: path.birthYear,
        sourceTeamId: teamId(row),
        sourceTeamSlot: selected.teamSlot,
        effectiveProjection: effective,
        updatedAt: source.updatedAt,
      }),
    }
    if (!equal(source, nextProjection)) {
      paths = paths.map(item =>
        item === next
          ? { ...item, updatedAt, nextCompetitionPath: { ...nextProjection, updatedAt } }
          : item,
      )
      changedYears.add(Number(next.birthYear))
    }
  }
  const masterPaths = array(masterEntry.competitionPaths, 'מסלולי מאסטר')
  let nextMasterPaths = masterPaths
  for (const year of changedYears) {
    const path = unique(paths, item => Number(item.birthYear) === year, 'מסלול מועדון')
    const old = unique(
      masterPaths,
      item => Number(item.birthYear) === year,
      'מסלול מאסטר',
    )
    const projected = buildClubsMasterCompetitionPathEntry(path)
    nextMasterPaths = nextMasterPaths.map(item =>
      item === old ? { ...item, ...projected } : item,
    )
  }
  return { competitionPaths: paths, masterCompetitionPaths: nextMasterPaths }
}
