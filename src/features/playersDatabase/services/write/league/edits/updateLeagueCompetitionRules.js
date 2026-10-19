// src/features/playersDatabase/services/write/league/edits/updateLeagueCompetitionRules.js

import { updateLeagueSeasonSettings } from './updateLeagueSeasonSettings.js'

export const updateLeagueCompetitionRules = ({
  leagueId,
  seasonId,
  competitionRules,
}) => updateLeagueSeasonSettings({ leagueId, seasonId, competitionRules })
