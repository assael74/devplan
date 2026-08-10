// features/playersDatabase/domain/adapters/leagueTableTeam.adapter.js

import { createLifecycle } from '../contracts/lifecycle.contract.js'
import { createEmptyTeamSeason } from '../contracts/teamSeason.contract.js'
import {
  cleanDomainValue,
  firstDomainValue,
  toDomainNumber,
  toDomainNumberOrZero,
} from '../contracts/domainValue.contract.js'

const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

const hasTeamStats = tableRow => {
  const stats = tableRow?.teamStats

  if (stats && typeof stats === 'object') {
    return [
      'teamGamePlayed',
      'gamesPlayed',
      'points',
      'goalsFor',
      'goalsAgainst',
    ].some(key => hasOwn(stats, key))
  }

  return [
    'games',
    'gamesPlayed',
    'teamGamePlayed',
    'points',
    'goalsFor',
    'goalsAgainst',
  ].some(key => hasOwn(tableRow, key))
}

const hasTeamRanking = tableRow => (
  hasOwn(tableRow, 'rank') ||
  hasOwn(tableRow, 'position') ||
  hasOwn(tableRow, 'leaguePosition')
)

export const adaptLeagueTableTeam = ({
  leagueDocument = {},
  seasonDocument = {},
  tableRow = {},
  target = 'current',
} = {}) => {
  const lifecycle = createLifecycle(target)
  const result = createEmptyTeamSeason()
  const stats = tableRow.teamStats || {}
  const summary = tableRow.scoutProfilesSummary || {}

  return {
    ...result,
    identity: {
      teamId: cleanDomainValue(
        firstDomainValue(
          tableRow.birthTeamId,
          tableRow.teamId
        )
      ),
      teamDocumentId: cleanDomainValue(
        firstDomainValue(
          tableRow.birthTeamDocumentId,
          tableRow.teamDocumentId,
          tableRow.birthTeamId
        )
      ),
      clubId: cleanDomainValue(tableRow.clubId),
      displayName: cleanDomainValue(
        firstDomainValue(
          tableRow.displayName,
          tableRow.teamName
        )
      ),
      teamSlot: toDomainNumberOrZero(
        firstDomainValue(
          tableRow.birthTeamSlot,
          tableRow.teamSlot
        )
      ) || 1,
    },
    season: {
      seasonId: cleanDomainValue(seasonDocument.seasonId),
      seasonKey: cleanDomainValue(seasonDocument.seasonKey),
      birthYear: toDomainNumber(seasonDocument.birthYear),
    },
    lifecycle,
    league: {
      leagueId: cleanDomainValue(
        firstDomainValue(
          leagueDocument.leagueId,
          leagueDocument.id
        )
      ),
      leagueLevel: toDomainNumber(
        firstDomainValue(
          seasonDocument.leagueLevel,
          leagueDocument.leagueLevel
        )
      ),
      ageGroupId: cleanDomainValue(
        firstDomainValue(
          seasonDocument.ageGroupId,
          leagueDocument.ageGroupId
        )
      ),
      ageGroupLabel: cleanDomainValue(
        firstDomainValue(
          seasonDocument.ageGroupLabel,
          leagueDocument.ageGroupLabel
        )
      ),
      region: cleanDomainValue(leagueDocument.region),
      leagueGames: toDomainNumber(seasonDocument.leagueTotalRound),
    },
    stats: {
      actual: {
        gamesPlayed: toDomainNumberOrZero(stats.teamGamePlayed),
        points: toDomainNumberOrZero(stats.points),
        goalsFor: toDomainNumberOrZero(stats.goalsFor),
        goalsAgainst: toDomainNumberOrZero(stats.goalsAgainst),
        goalsForPerGame: toDomainNumber(stats.goalsForPerGame),
        goalsAgainstPerGame: toDomainNumber(stats.goalsAgainstPerGame),
      },
      projected: null,
    },
    ranking: {
      tableRank: toDomainNumber(tableRow.rank),
      attackRank: null,
      defenseRank: null,
    },
    scoutProfilesSummary: {
      total: toDomainNumberOrZero(summary.total),
      profileCounts: summary.profileCounts && typeof summary.profileCounts === 'object'
        ? summary.profileCounts
        : {},
    },
    playersCount: toDomainNumberOrZero(
      firstDomainValue(
        tableRow.playersCount,
        tableRow.teamPlayersCount
      )
    ),
    loadStatus: {
      hasPlayers: hasOwn(tableRow, 'hasPlayers')
        ? Boolean(tableRow.hasPlayers)
        : toDomainNumberOrZero(
            firstDomainValue(
              tableRow.playersCount,
              tableRow.teamPlayersCount
            )
          ) > 0,
      hasStats: Boolean(tableRow.hasStats),
      statsComplete: Boolean(tableRow.statsComplete),
    },
    completeness: {
      ...result.completeness,
      hasStats: hasTeamStats(tableRow),
      hasRanking: hasTeamRanking(tableRow),
      hasScoutSummary: Boolean(summary.profileCounts),
    },
    metadata: {
      teamUrl: cleanDomainValue(
        firstDomainValue(
          stats.teamUrl,
          tableRow.teamUrl
        )
      ),
      seasonUrl: cleanDomainValue(seasonDocument.seasonUrl),
      sourceCollection: 'leagues',
      sourceDocumentId: cleanDomainValue(
        firstDomainValue(
          leagueDocument.leagueDocumentId,
          leagueDocument.id
        )
      ),
      sourceTarget: lifecycle.type,
      updatedAt: tableRow.updatedAt || seasonDocument.updatedAt || null,
    },
    calculation: {
      mode: lifecycle.usesProjection ? 'projected' : 'final',
      engineVersion: '',
      calculatedAt: tableRow.updatedAt || null,
    },
  }
}
