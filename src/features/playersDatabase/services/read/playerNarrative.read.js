// src/features/playersDatabase/services/read/playerNarrative.read.js

import {
  adaptBirthTeamDocumentSeason,
} from '../../domain/index.js'
import { buildNarrativePlan } from '../../domain/narrative/index.js'
import { isSameSeason } from '../../model/season.model.js'
import { getTeamById } from './team.js'

const clean = value => String(value || '').trim()

const getTeamDocumentId = season => clean(
  season?.team?.teamDocumentId || season?.team?.teamId
)

const findTeamSeasonRow = ({ teamDocument, playerSeason }) => {
  const current = Array.isArray(teamDocument?.current) ? teamDocument.current : []
  const history = Array.isArray(teamDocument?.history) ? teamDocument.history : []
  const rows = [...current, ...history]

  return rows.find(row => isSameSeason(row, playerSeason?.season || {})) || null
}

const adaptTeamSeason = ({ teamDocument, playerSeason }) => {
  const row = findTeamSeasonRow({
    teamDocument,
    playerSeason,
  })

  if (!row) return null

  const target = (Array.isArray(teamDocument?.history) ? teamDocument.history : [])
    .includes(row)
    ? 'history'
    : 'current'
  const result = adaptBirthTeamDocumentSeason({
    teamDocument,
    seasonDocument: row,
    target,
  })

  return {
    ...result,
    ranking: {
      ...result.ranking,
      tableRank: row.tableRank === undefined ? null : Number(row.tableRank),
      attackRank: row.tableAttackRank === undefined ? null : Number(row.tableAttackRank),
      defenseRank: row.tableDefenseRank === undefined ? null : Number(row.tableDefenseRank),
    },
    performance: row.teamScout || row.performance || result.performance,
    completeness: {
      ...result.completeness,
      hasRanking: row.tableRank !== undefined && row.tableRank !== null,
      hasPerformance: Boolean(row.teamScout || row.performance),
    },
  }
}

const readNarrativeTeams = async seasons => {
  const rows = Array.isArray(seasons) ? seasons : []
  const documentIds = [...new Set(rows.map(getTeamDocumentId).filter(Boolean))]
  const documents = await Promise.all(documentIds.map(getTeamById))
  const documentMap = new Map(
    documents.filter(Boolean).map(document => [clean(document.id), document])
  )

  return rows
    .map(playerSeason => {
      const documentId = getTeamDocumentId(playerSeason)
      const teamDocument = documentMap.get(documentId)

      return teamDocument
        ? adaptTeamSeason({ teamDocument, playerSeason })
        : null
    })
    .filter(Boolean)
}

export const readPlayerNarrativePlan = async ({ playerDomain = {} } = {}) => {
  const seasons = Array.isArray(playerDomain.seasons) ? playerDomain.seasons : []
  const teams = await readNarrativeTeams(seasons)

  return buildNarrativePlan({
    player: playerDomain.identity || {},
    seasons,
    teams,
    events: playerDomain.events || [],
    narrative: playerDomain.narrative || null,
  })
}
