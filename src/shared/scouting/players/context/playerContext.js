// src/shared/scouting/players/context/playerContext.js

import {
  buildPlayerCompetitionContext,
} from './playerCompetitionContext.js'

import {
  buildPlayerPositionContext,
} from './playerPositionContext.js'

import {
  buildPlayerTeamContext,
} from './playerTeamContext.js'

const firstDefined = (values = []) => {
  return values.find(value => value !== null && value !== undefined && value !== '')
}

const resolveClubLevel = ({ player = {}, team = {}, clubLevel } = {}) => {
  return firstDefined([
    clubLevel,
    player.clubLevel,
    player.club?.level,
    team.clubLevel,
    team.club?.level,
  ])
}


const resolveClubStrengthLevel = ({ player = {}, team = {}, clubStrengthLevel, clubLevel } = {}) => {
  return firstDefined([
    clubStrengthLevel,
    player.clubStrengthLevel,
    player.club?.clubStrengthLevel,
    team.clubStrengthLevel,
    team.club?.clubStrengthLevel,
    clubLevel,
  ])
}

const resolveLeagueLevel = ({ player = {}, team = {}, leagueLevel } = {}) => {
  return firstDefined([
    leagueLevel,
    player.leagueLevel,
    player.league?.level,
    team.leagueLevel,
    team.league?.level,
    team.level,
  ])
}

export const buildPlayerScoutContext = ({
  profile,
  player,
  team,
  clubLevel,
  clubStrengthLevel,
  leagueLevel,
} = {}) => {
  const resolvedClubLevel = resolveClubLevel({ player, team, clubLevel })
  const resolvedClubStrengthLevel = resolveClubStrengthLevel({
    player,
    team,
    clubStrengthLevel,
    clubLevel: resolvedClubLevel,
  })
  const resolvedLeagueLevel = resolveLeagueLevel({ player, team, leagueLevel })

  return {
    team: buildPlayerTeamContext({ profile, team }),
    competition: buildPlayerCompetitionContext({
      clubLevel: resolvedClubLevel,
      clubStrengthLevel: resolvedClubStrengthLevel,
      leagueLevel: resolvedLeagueLevel,
    }),
    position: buildPlayerPositionContext({ profile, player }),
  }
}
