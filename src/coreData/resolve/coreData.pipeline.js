// src/coreData/resolve/coreData.pipeline.js
import { mergeCoreShorts } from './merge-stage.js'
import { buildCoreIndexes } from './index-stage.js'
import {
  enrichTeams,
  enrichPlayers,
  enrichMeetings,
  enrichScouting,
  attachPlayerStatsAndVideos,
  attachTeamStatsAndVideos,
} from './enrich-stage.js'
import { buildFinalRelations } from './relations-stage.js'

export function runCoreDataMergeStage(input = {}) {
  return mergeCoreShorts(input)
}

export function runCoreDataIndexStage(merged) {
  return buildCoreIndexes(merged)
}

export function runCoreDataEnrichStage(merged, indexes) {
  const teams = enrichTeams(merged, indexes)
  const players = enrichPlayers(merged, indexes, teams)
  const meetings = enrichMeetings(merged, indexes, players)
  const scouting = enrichScouting(merged)

  const playersWithVideos = attachPlayerStatsAndVideos(
    players,
    merged,
    indexes,
    teams
  )

  const teamsWithVideos = attachTeamStatsAndVideos(teams, indexes)

  return {
    teamsWithVideos,
    playersWithVideos,
    scouting,
    meetings,
  }
}

export function runCoreDataRelationsStage({
  merged,
  indexes,
  enriched,
}) {
  return buildFinalRelations({
    merged,
    indexes,
    teamsWithVideos: enriched.teamsWithVideos,
    playersWithVideos: enriched.playersWithVideos,
    scouting: enriched.scouting,
    meetings: enriched.meetings,
  })
}

export function resolveCoreDataPipeline(input = {}) {
  const merged = runCoreDataMergeStage(input)
  const indexes = runCoreDataIndexStage(merged)
  const enriched = runCoreDataEnrichStage(merged, indexes)

  return runCoreDataRelationsStage({
    merged,
    indexes,
    enriched,
  })
}
