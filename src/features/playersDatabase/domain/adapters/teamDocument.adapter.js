// src/features/playersDatabase/domain/adapters/teamDocument.adapter.js

import { normalizeTeamIdentity } from '../../model/teamIdentity.model.js'
import { normalizeTeamStats } from '../../model/teamStats.model.js'
import { normalizeSeasonIdentity } from '../../model/season.model.js'
import { createEmptyTeamSeason } from '../contracts/teamSeason.contract.js'
import { normalizeTeamScout } from '../contracts/teamScout.contract.js'
import {
  cleanDomainValue,
  toDomainNumber,
} from '../contracts/domainValue.contract.js'

export const adaptTeamDocumentSeason = ({
  teamDocument = {},
  seasonDocument = {},
  target = 'current',
  league = {},
} = {}) => {
  const teamIdentity = normalizeTeamIdentity({
    team: seasonDocument,
    fallback: teamDocument,
  })
  const seasonIdentity = normalizeSeasonIdentity({ season: seasonDocument })
  const stats = normalizeTeamStats(seasonDocument.teamStats || seasonDocument)
  const rawScout = seasonDocument.scout ||
    seasonDocument.teamScout ||
    seasonDocument.scoutPerformance ||
    {}
  const result = createEmptyTeamSeason()

  return {
    ...result,
    identity: {
      teamId: cleanDomainValue(teamIdentity.birthTeamId || teamIdentity.teamId),
      teamDocumentId: cleanDomainValue(
        teamIdentity.birthTeamDocumentId || teamIdentity.teamDocumentId
      ),
      clubId: cleanDomainValue(teamIdentity.clubId),
      displayName: cleanDomainValue(
        seasonDocument.displayName || teamDocument.displayName || seasonDocument.teamName
      ),
    },
    season: {
      seasonId: cleanDomainValue(seasonIdentity.seasonId),
      seasonKey: cleanDomainValue(seasonIdentity.seasonKey),
      birthYear: toDomainNumber(seasonDocument.birthYear),
      isCurrent: cleanDomainValue(target) !== 'history',
    },
    league: {
      leagueId: cleanDomainValue(seasonDocument.leagueId || league.id),
      leagueLevel: toDomainNumber(seasonDocument.leagueLevel || league.level),
      ageGroupId: cleanDomainValue(seasonDocument.ageGroupId || league.ageGroupId),
      ageGroupLabel: cleanDomainValue(
        seasonDocument.ageGroupLabel || league.ageGroupLabel
      ),
      region: cleanDomainValue(seasonDocument.region || league.region),
      leagueGames: toDomainNumber(
        seasonDocument.leagueTotalRound || league.leagueTotalRound
      ),
    },
    table: {
      rank: toDomainNumber(seasonDocument.tableRank || seasonDocument.rank),
      attackRank: toDomainNumber(
        seasonDocument.tableAttackRank || rawScout.offense?.rank
      ),
      defenseRank: toDomainNumber(
        seasonDocument.tableDefenseRank || rawScout.defense?.rank
      ),
      games: stats.teamGamePlayed,
      points: stats.points,
      goalsFor: stats.goalsFor,
      goalsAgainst: stats.goalsAgainst,
      goalsForPerGame: stats.goalsForPerGame,
      goalsAgainstPerGame: stats.goalsAgainstPerGame,
    },
    scout: normalizeTeamScout({
      offense: rawScout.offense || {},
      defense: rawScout.defense || {},
      normalization: rawScout.normalization || {},
      context: {
        leagueLevel: seasonDocument.leagueLevel || league.level,
        leagueGames: seasonDocument.leagueTotalRound || league.leagueTotalRound,
        tableRank: seasonDocument.tableRank || seasonDocument.rank,
      },
      source: rawScout.source || {},
    }),
    metadata: {
      teamUrl: cleanDomainValue(seasonDocument.teamUrl || teamDocument.teamUrl),
      seasonUrl: cleanDomainValue(seasonDocument.seasonUrl),
      sourceCollection: 'birthTeams',
      sourceDocumentId: cleanDomainValue(
        teamIdentity.birthTeamDocumentId || teamIdentity.teamDocumentId
      ),
      sourceTarget: cleanDomainValue(target) === 'history' ? 'history' : 'current',
    },
  }
}
