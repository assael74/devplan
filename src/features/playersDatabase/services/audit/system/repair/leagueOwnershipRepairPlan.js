// src/features/playersDatabase/services/audit/system/repair/leagueOwnershipRepairPlan.js

import { buildPlayerSeasonDocumentId, buildTeamId, buildTeamSeasonDocumentId } from '../../../../domain/identity/index.js'
import { buildLeagueLoadProjectionRepairPlan } from '../../../../domain/league/leagueWritePlan.builder.js'
import { buildLeaguePerformanceProjection } from '../../../../domain/league/leaguePerformance.builder.js'
import { buildPlayerSearchIndexProjection } from '../../../../domain/stats/statsProjection.builder.js'
import { buildStatsAuditExpected } from '../../stats/buildExpected.js'
import { getTeamSeasonPlayerIds } from '../evaluate.js'
import { sameRepairValue } from './repairValue.js'

const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const rows = value => Array.isArray(value) ? value : []
const clean = value => String(value === null || value === undefined ? '' : value).trim()
const seasonOf = (league, seasonId) => object(object(league.seasonsById)[seasonId])
const teamsOf = (league, seasonId) => object(seasonOf(league, seasonId).table && seasonOf(league, seasonId).table.teamsById)

const applyCenterPlan = ({
  plan,
  leaguesCenter,
  clubsCenter,
  originalClubsCenter,
  ambiguousTeamIds,
}) => {
  const leagueTarget = plan.leaguesCenterProjection
  const previousLeague = object(object(leaguesCenter.leaguesById)[plan.leagueId])
  const previousSeason = object(object(previousLeague.seasonsById)[plan.seasonId])
  const teamsById = Object.fromEntries(Object.entries(leagueTarget.season.teamsById).map(([teamId, team]) => [
    teamId, { ...object(object(previousSeason.teamsById)[teamId]), ...team },
  ]))
  const nextLeaguesCenter = {
    ...leaguesCenter,
    updatedAt: leagueTarget.updatedAt,
    leaguesById: {
      ...object(leaguesCenter.leaguesById),
      [plan.leagueId]: {
        ...previousLeague,
        identity: leagueTarget.identity,
        seasonsById: {
          ...object(previousLeague.seasonsById),
          [plan.seasonId]: { ...previousSeason, ...leagueTarget.season, teamsById },
        },
      },
    },
  }
  const clubTarget = plan.clubsCenterProjection
  const clubsById = { ...object(clubsCenter.clubsById) }
  clubTarget.clubWrites.forEach(write => {
    const previous = object(clubsById[write.clubId])
    const teamsById = { ...object(previous.teamsById) }
    Object.entries(object(write.upsertTeamsById)).forEach(([teamId, team]) => {
      if (!ambiguousTeamIds.has(teamId)) {
        const originalClub = object(object(originalClubsCenter.clubsById)[write.clubId])
        teamsById[teamId] = {
          ...object(object(originalClub.teamsById)[teamId]), ...object(teamsById[teamId]), ...team,
        }
      }
    })
    write.deleteTeamIds.forEach(teamId => {
      if (!ambiguousTeamIds.has(teamId)) delete teamsById[teamId]
    })
    clubsById[write.clubId] = { ...previous, ...object(write.clubProfile), teamsById }
  })
  return {
    leaguesCenter: nextLeaguesCenter,
    clubsCenter: {
      ...clubsCenter,
      seasonId: plan.seasonId,
      seasonKey: clubTarget.seasonKey,
      updatedAt: clubTarget.updatedAt,
      leaguesById: { ...object(clubsCenter.leaguesById), [plan.leagueId]: clubTarget.league },
      clubsById,
    },
  }
}

export const buildLeagueOwnershipRepairPlan = ({ actual = {}, finding = {}, input = {} } = {}) => {
  const duplicate = finding.target === 'leagues' && Array.isArray(finding.actual)
  const brokenLeagueRef = finding.target === 'teamSeasons' && finding.owner === 'league'
  if (finding.type !== 'broken_relation' || (!duplicate && !brokenLeagueRef)) return { supported: false }
  if (!finding.teamId || !finding.seasonId) return { supported: false }

  const { teamId, seasonId } = finding
  const owners = rows(actual.leagues).filter(row => teamsOf(row.data, seasonId)[teamId])
  if (!owners.length) return { supported: false }
  const fields = owners.length > 1 ? [{
    name: 'leagueId',
    label: 'הליגה שבה הקבוצה צריכה להישאר בעונה זו',
    type: 'select',
    required: true,
    options: owners.map(row => ({
      value: row.id,
      label: `${clean(object(row.data.names).display) || row.id} (${row.id})`,
    })),
  }] : []
  const base = {
    supported: true, allowed: false, fields, changes: [], guards: [],
    label: 'תקן שיוך לליגה',
    description: owners.length > 1
      ? 'הקבוצה תישאר בליגה שתבחר ותוסר מטבלאות הליגות האחרות בעונה זו. עונת הקבוצה, התוצרים ואינדקסי השחקנים יסונכרנו. נתוני הסגל והסטטיסטיקה המקוריים נשמרים.'
      : 'עונת הקבוצה, ההפניות והתוצרים יסונכרנו עם הליגה הקנונית היחידה שמכילה את הקבוצה בעונה זו. נתוני הסגל והסטטיסטיקה המקוריים נשמרים.',
  }
  const selected = owners.length === 1 ? owners[0] : owners.find(row => row.id === clean(input.leagueId))
  if (!selected) return { ...base, reason: 'יש לבחור את הליגה הנכונה. לא ניתן להסיק אותה מהשיוך הכפול.' }
  if (duplicate && owners.length < 2) return { ...base, reason: 'השיוך הכפול כבר אינו קיים. יש להריץ בדיקה חדשה.' }

  try {
    const changes = new Map()
    const guards = new Map()
    const guard = (target, row) => {
      if (row) guards.set(`${target}/${row.id}`, { target, documentId: row.id, before: row.data })
    }
    const original = (target, id) => rows(actual[target]).find(row => row.id === id)
    const current = (target, id) => {
      const change = changes.get(`${target}/${id}`)
      return change ? change.after : (original(target, id) || {}).data || null
    }
    const put = (target, id, after, summary) => {
      const before = (original(target, id) || {}).data || null
      if (!sameRepairValue(before, after)) changes.set(`${target}/${id}`, { target, documentId: id, before, after, summary })
    }
    const profiles = Object.fromEntries(rows(actual.clubProfiles).map(row => [row.id, row.data]))
    const teamDocumentId = buildTeamSeasonDocumentId({ teamId, seasonId })
    const winnerSeason = seasonOf(selected.data, seasonId)
    const winnerTeam = teamsOf(selected.data, seasonId)[teamId]

    owners.forEach(row => {
      const season = seasonOf(row.data, seasonId)
      const team = teamsOf(row.data, seasonId)[teamId]
      if (
        clean(row.data.leagueId) !== row.id
        || buildTeamId({ clubId: team.clubId, birthYear: season.birthYear, teamSlot: team.teamSlot }) !== teamId
      ) throw new Error('יש לתקן תחילה את זהות הליגה או הקבוצה לפני הכרעת השיוך.')
      guard('leagues', row)
    })

    const currentTeam = current('teamSeasons', teamDocumentId)
    if (currentTeam) {
      const identity = object(currentTeam.identity)
      if (
        identity.teamId !== teamId || identity.teamSeasonDocumentId !== teamDocumentId
        || identity.seasonId !== seasonId || identity.clubId !== winnerTeam.clubId
      ) throw new Error('זהות עונת הקבוצה אינה תקינה. יש לתקן אותה לפני שינוי השיוך.')
      getTeamSeasonPlayerIds(currentTeam).forEach(playerId => {
        const playerSeasonId = buildPlayerSeasonDocumentId({ playerId, seasonId })
        const playerSeason = original('playerSeasons', playerSeasonId)
        const playerIdentity = object(playerSeason && playerSeason.data.identity)
        if (!playerSeason) {
          throw new Error(`יש לשחזר תחילה את עונת השחקן החסרה ${playerId}, ואז לתקן את השיוך לליגה.`)
        }
        if (
          clean(playerIdentity.playerId) !== playerId || clean(playerIdentity.seasonId) !== seasonId ||
          clean(playerIdentity.playerSeasonDocumentId) !== playerSeasonId
        ) throw new Error(`יש לתקן תחילה את זהות עונת השחקן ${playerId}, ואז לתקן את השיוך לליגה.`)
        guard('playerSeasons', playerSeason)
      })
      put('teamSeasons', teamDocumentId, {
        ...currentTeam,
        identity: {
          ...identity, leagueId: selected.id,
          ageGroupId: clean(selected.data.ageGroupId),
          seasonKey: clean(winnerSeason.seasonKey),
          seasonStatus: clean(winnerSeason.seasonStatus),
        },
      }, `שיוך עונת הקבוצה לליגה ${selected.id}`)
      const root = current('teamRoots', teamId)
      if (root) {
        put('teamRoots', teamId, {
          ...root,
          seasonRefsById: {
            ...object(root.seasonRefsById),
            [seasonId]: {
              ...object(object(root.seasonRefsById)[seasonId]),
              teamSeasonDocumentId: teamDocumentId,
              leagueId: selected.id,
              ageGroupId: clean(selected.data.ageGroupId),
              seasonKey: clean(winnerSeason.seasonKey),
              seasonStatus: clean(winnerSeason.seasonStatus),
            },
          },
        }, 'סנכרון הפניית העונה במסמך הקבוצה עם הליגה הנכונה')
      }
    }

    owners.forEach(row => {
      const season = seasonOf(row.data, seasonId)
      const teamsById = { ...teamsOf(row.data, seasonId) }
      if (row.id !== selected.id) {
        delete teamsById[teamId]
        const projection = buildLeaguePerformanceProjection({
          context: {
            canonicalRows: Object.entries(teamsById).map(([id, team]) => ({ ...team, teamId: id })),
            resolvedLeagueLevel: row.data.level,
            resolvedLeagueTotalRound: season.leagueTotalRound,
          },
          clubProfilesById: profiles,
          calculatedAt: object(season.performanceCalculation).calculatedAt || null,
        })
        Object.keys(teamsById).forEach(id => {
          teamsById[id] = { ...teamsById[id], performance: projection.performanceByTeamId[id] }
        })
        put('leagues', row.id, {
          ...row.data,
          seasonsById: {
            ...row.data.seasonsById,
            [seasonId]: {
              ...season,
              table: {
                ...season.table,
                teamsById,
                tableState: Object.keys(teamsById).length ? 'LOADED' : 'LOADED_EMPTY',
              },
              performanceCalculation: projection.performanceCalculation,
            },
          },
        }, `הסרת הקבוצה מהליגה ${row.id} ועדכון ביצועי הטבלה מהנתונים הקיימים`)
      } else if (currentTeam) {
        const expected = buildStatsAuditExpected({
          actual: { teamSeason: current('teamSeasons', teamDocumentId), league: row.data },
          seasonId,
        }).expected
        teamsById[teamId] = {
          ...teamsById[teamId],
          stats: expected.leagueTeamPatch.stats,
          scouting: { ...object(teamsById[teamId].scouting), ...expected.leagueTeamPatch.scouting },
        }
        put('leagues', row.id, {
          ...row.data,
          seasonsById: { ...row.data.seasonsById, [seasonId]: { ...season, table: { ...season.table, teamsById } } },
        }, 'סנכרון מצב הסטטיסטיקה והסקאוט של הקבוצה בליגה שנבחרה')
      }
    })

    const nextLeagueRows = rows(actual.leagues).map(row => ({ id: row.id, data: current('leagues', row.id) }))
    const ownerCountByTeamId = new Map()
    nextLeagueRows.forEach(row => {
      Object.keys(teamsOf(row.data, seasonId)).forEach(id => {
        ownerCountByTeamId.set(id, (ownerCountByTeamId.get(id) || 0) + 1)
      })
    })
    const ambiguousTeamIds = new Set(
      [...ownerCountByTeamId].filter(([, count]) => count > 1).map(([id]) => id)
    )
    const nextTeamSeasons = rows(actual.teamSeasons).map(row => ({ ...current('teamSeasons', row.id), id: row.id }))
    let leaguesCenter = object(current('leaguesCenter', 'all'))
    let clubsCenter = object(current('clubsCenter', seasonId))
    const originalClubsCenter = clubsCenter
    owners.forEach(owner => {
      const league = current('leagues', owner.id)
      const season = seasonOf(league, seasonId)
      const locations = []
      Object.entries(object(clubsCenter.clubsById)).forEach(([clubId, club]) => {
        Object.entries(object(club.teamsById)).forEach(([id, team]) => {
          if (team.leagueId === owner.id) locations.push({ clubId, teamId: id, team })
        })
      })
      const otherLeagueIdsByTeamId = {}
      nextLeagueRows.filter(row => row.id !== owner.id).forEach(row => {
        Object.keys(teamsOf(row.data, seasonId)).forEach(id => {
          otherLeagueIdsByTeamId[id] = [...(otherLeagueIdsByTeamId[id] || []), row.id]
        })
        guard('leagues', original('leagues', row.id))
      })
      Object.values(teamsOf(league, seasonId)).forEach(team => {
        guard('clubProfiles', original('clubProfiles', team.clubId))
      })
      rows(actual.teamSeasons).filter(row => object(row.data.identity).seasonId === seasonId).forEach(row => guard('teamSeasons', row))
      const plan = buildLeagueLoadProjectionRepairPlan({
        leagueId: owner.id, seasonId, existingLeague: league,
        clubProfilesById: profiles, existingTeamSeasons: nextTeamSeasons,
        previousLeaguesCenterTeamsById: object(object(object(leaguesCenter.leaguesById)[owner.id]).seasonsById)[seasonId]
          ? object(leaguesCenter.leaguesById[owner.id].seasonsById[seasonId].teamsById) : {},
        previousClubsCenterTeamLocations: locations,
        otherLeagueIdsByTeamId,
        updatedAt: season.updatedAt || null,
      })
      const centers = applyCenterPlan({ plan, leaguesCenter, clubsCenter, originalClubsCenter, ambiguousTeamIds })
      leaguesCenter = centers.leaguesCenter
      clubsCenter = centers.clubsCenter
      plan.teamSeasonCompetitionSnapshots.forEach(snapshot => {
        const document = current('teamSeasons', snapshot.teamSeasonDocumentId)
        if (ambiguousTeamIds.has(clean(object(document && document.identity).teamId))) return
        put('teamSeasons', snapshot.teamSeasonDocumentId, {
          ...document, competitionSnapshot: snapshot.competitionSnapshot,
        }, 'סנכרון תמונת התחרות עם הליגה הנכונה')
      })
    })
    put('leaguesCenter', 'all', leaguesCenter, 'סנכרון הליגות המושפעות במרכז הליגות')
    put('clubsCenter', seasonId, clubsCenter, 'סנכרון הקבוצות המושפעות במרכז המועדונים')

    if (currentTeam) {
      const teamSeason = current('teamSeasons', teamDocumentId)
      rows(actual.playerSeasons).forEach(row => {
        const team = object(row.data.teamsById)[teamId]
        if (object(row.data.identity).seasonId !== seasonId || !team) return
        put('playerSeasons', row.id, {
          ...row.data,
          teamsById: { ...row.data.teamsById, [teamId]: { ...team, leagueId: selected.id, ageGroupId: clean(selected.data.ageGroupId) } },
        }, 'עדכון הליגה בקשר השחקן לקבוצה')
      })
      getTeamSeasonPlayerIds(teamSeason).forEach(playerId => {
        const playerRoot = original('playerRoots', playerId)
        guard('playerRoots', playerRoot)
        const projection = buildPlayerSearchIndexProjection({
          playerId, playerRoot: playerRoot ? playerRoot.data : null,
          teamSeason, league: current('leagues', selected.id),
          clubProfile: profiles[winnerTeam.clubId], seasonId,
          updatedAt: object(teamSeason.stats).updatedAt || null,
        })
        const { documentId, ...document } = projection
        put('playerSearchIndexes', documentId, document, 'סנכרון אינדקס השחקן עם הליגה הנכונה')
      })
    }
    return { ...base, allowed: true, reason: '', changes: [...changes.values()], guards: [...guards.values()] }
  } catch (error) {
    return { ...base, reason: error instanceof Error ? error.message : 'לא ניתן להכין את תיקון השיוך מהמקורות הקיימים.' }
  }
}
