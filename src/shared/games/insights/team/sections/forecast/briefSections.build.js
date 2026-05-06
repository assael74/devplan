// shared/games/insights/team/sections/forecast/briefSections.build.js

import { buildTeamGamesDifficultyBrief } from '../difficulty/index.js'
import { buildTeamGamesHomeAwayBrief } from '../homeAway/index.js'
import { buildTeamGamesSquadBrief } from '../squad/index.js'
import { buildTeamGamesForecastBrief } from './forecast.brief.js'

export function buildTeamGamesBriefSections(insights = {}) {
  return {
    forecast: buildTeamGamesForecastBrief(insights),
    homeAway: buildTeamGamesHomeAwayBrief(insights),
    difficulty: buildTeamGamesDifficultyBrief(insights),
    squad: buildTeamGamesSquadBrief(insights),
  }
}
