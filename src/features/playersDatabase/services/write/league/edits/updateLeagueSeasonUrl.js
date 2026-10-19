// src/features/playersDatabase/services/write/league/edits/updateLeagueSeasonUrl.js

import { updateLeagueSeasonSettings } from './updateLeagueSeasonSettings.js'

export const updateLeagueSeasonUrl = ({ leagueId, seasonId, seasonUrl }) => (
  updateLeagueSeasonSettings({ leagueId, seasonId, seasonUrl })
)
