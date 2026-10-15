// src/features/playersDatabase/ui/pages/teamPage/information/model/teamWorkspaceSeason.model.js

import { buildTeamPageView } from '../../../../../model/team/page/teamPageView.model.js'
import { buildTeamPageSeasonView } from '../../../../../model/team/page/teamPagePlayer.model.js'
import {
  findTeamPageLeagueSeasonDoc,
  findTeamPageSeasonDoc,
} from '../../../../../model/team/page/teamPageSeason.model.js'

export const buildTeamWorkspaceSeasonContext = ({
  seasonOption,
  selectedSeasonOption,
  team,
  selectedTeamSeason,
  players,
  clubsDirectory,
  leagueDoc,
  leagueDocuments,
  teamDoc,
  teamSeasons,
}) => {
  if (!seasonOption || seasonOption.optionKey === selectedSeasonOption?.optionKey) {
    return { team, season: selectedTeamSeason, players }
  }

  const leagueSeason = findTeamPageLeagueSeasonDoc({
    leagueDoc,
    leagueDocuments,
    selectedSeasonOption: seasonOption,
  })
  const seasonDocument = findTeamPageSeasonDoc({
    teamDoc,
    teamSeasons,
    selectedSeasonOption: seasonOption,
  })
  const season = buildTeamPageSeasonView({
    teamSeason: seasonDocument,
    selectedSeasonOption: seasonOption,
  })

  return {
    team: buildTeamPageView({
      clubsDirectory,
      teamId: team.id,
      leagueDoc: leagueSeason?.leagueDoc || leagueDoc,
      teamDoc,
      teamSeasons,
      selectedSeasonOption: seasonOption,
      selectedLeagueSeason: leagueSeason,
      selectedTeamSeason: season,
    }),
    season,
    players: season?.teamPlayers || [],
  }
}
