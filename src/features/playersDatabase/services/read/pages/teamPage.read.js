// features/playersDatabase/services/read/teamPage.read.js

import { getLeagueById } from '../entities/league.js'
import { getTeamById } from '../entities/team.js'
import { getTeamSeason, listTeamSeasons } from '../entities/teamSeason.js'
import { readLeaguesMasterDocument } from '../masters/leaguesMaster.read.js'
import {
  buildClubSeasonIdentityScopesFromLeaguesMaster,
  readClubSeasonIdentityIndexes,
} from '../masters/clubSeasonIdentityIndex.read.js'
import { resolveTeamBirthYear } from '../../../model/team/teamIdentity.model.js'
import { buildTeamPageSeasonSnapshots } from '../../../model/team/page/teamPageSeasonSnapshots.model.js'
import { buildTeamPageData } from '../../../model/team/page/teamPageData.model.js'
import { PLAYERS_DATABASE_SEASONS_CATALOG } from '../../../catalog/seasons.catalog.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const getSeasonIdentity = season => String(
  season?.seasonKey || season?.seasonId || season?.id || ''
).trim()

export const readTeamPageData = async ({ leagueId = '', teamId = '' } = {}) => {
  const [leagueDoc, teamDoc, leaguesMasterDoc] = await Promise.all([
    getLeagueById(leagueId),
    getTeamById(teamId),
    readLeaguesMasterDocument(),
  ])

  const birthTeamDocumentId = teamDoc?.id || teamId
  const seasonEntries = Array.isArray(teamDoc?.seasons) ? teamDoc.seasons : []
  const [listedTeamSeasons, indexedTeamSeasons] = await Promise.all([
    listTeamSeasons(birthTeamDocumentId),
    Promise.all(seasonEntries.map(entry => getTeamSeason({
      birthTeamDocumentId,
      seasonKey: entry?.seasonKey,
    }))),
  ])
  const teamSeasonsByIdentity = new Map()

  ;[...listedTeamSeasons, ...indexedTeamSeasons]
    .filter(Boolean)
    .forEach(season => {
      const identity = getSeasonIdentity(season)
      if (identity && !teamSeasonsByIdentity.has(identity)) {
        teamSeasonsByIdentity.set(identity, season)
      }
    })

  const teamSeasons = [...teamSeasonsByIdentity.values()]
  const birthYear = resolveTeamBirthYear({
    teamId,
    team: teamDoc,
  })
  const masterIdentityScopes = buildClubSeasonIdentityScopesFromLeaguesMaster({
    leaguesMasterDoc,
  }).filter(scope => Number(scope.birthYear) === Number(birthYear))
  const identityScopes = [
    ...masterIdentityScopes,
    ...PLAYERS_DATABASE_SEASONS_CATALOG.map(season => ({
      seasonKey: season.seasonKey,
      birthYear,
    })),
  ]
  const identityDocuments = birthYear
    ? await readClubSeasonIdentityIndexes({ scopes: identityScopes })
    : []
  const matchingIdentityEntries = identityDocuments.flatMap(index => (
    (Array.isArray(index?.entries) ? index.entries : [])
      .filter(entry => clean(entry?.teamId) === clean(teamId))
      .map(entry => ({
        seasonKey: clean(index?.seasonKey),
        leagueId: clean(entry?.leagueId),
      }))
  ))
  const relatedLeagueIds = new Set([
    clean(leagueId),
    ...teamSeasons.map(season => clean(season?.leagueId)),
    ...matchingIdentityEntries.map(entry => entry.leagueId),
  ].filter(Boolean))
  const relatedLeagueResults = await Promise.all(
    [...relatedLeagueIds].map(async id => ({
      leagueId: id,
      document: await getLeagueById(id),
    }))
  )
  const leagueDocuments = relatedLeagueResults
    .map(result => result.document)
    .filter(Boolean)
  const seasonSnapshots = buildTeamPageSeasonSnapshots({
    teamId,
    teamSeasons,
    leagueDocuments,
  })
  const teamPageData = buildTeamPageData({
    teamId,
    teamDocument: teamDoc,
    seasonSnapshots,
  })
  const teamSeasonBySeasonKey = new Map(
    teamSeasons.map(season => [getSeasonIdentity(season), season])
  )
  const expectedTeamSeasonStates = new Map()

  matchingIdentityEntries.forEach(entry => {
    if (!entry.seasonKey) return
    expectedTeamSeasonStates.set(entry.seasonKey, {
      seasonKey: entry.seasonKey,
      leagueId: entry.leagueId,
      documentExists: teamSeasonBySeasonKey.has(entry.seasonKey),
      document: teamSeasonBySeasonKey.get(entry.seasonKey) || null,
    })
  })
  teamSeasons.forEach(season => {
    const seasonKey = getSeasonIdentity(season)
    if (!seasonKey || expectedTeamSeasonStates.has(seasonKey)) return
    expectedTeamSeasonStates.set(seasonKey, {
      seasonKey,
      leagueId: clean(season?.leagueId),
      documentExists: true,
      document: season,
    })
  })

  return {
    leagueDoc,
    teamDoc,
    teamSeasons,
    seasonSnapshots,
    teamPageData,
    leagueDocuments,
    documentLoadState: {
      leaguesMaster: {
        documentExists: leaguesMasterDoc?.documentExists === true,
        document: leaguesMasterDoc || null,
      },
      identityIndexes: identityDocuments,
      leagueDocuments: relatedLeagueResults.map(result => ({
        leagueId: result.leagueId,
        documentExists: Boolean(result.document),
        document: result.document || null,
      })),
      teamRoot: {
        teamId: clean(teamId),
        documentExists: Boolean(teamDoc),
        document: teamDoc || null,
      },
      teamSeasons: [...expectedTeamSeasonStates.values()],
    },
  }
}
