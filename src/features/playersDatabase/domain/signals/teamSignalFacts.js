// src/features/playersDatabase/domain/signals/teamSignalFacts.js

import { TEAM_SIGNAL_CALIBRATION } from '../../../../shared/scouting/teams/signals/teamSignalCalibration.js'

export const buildTeamClubLevelGap = ({ team = {}, club = {} }) => {
  const primary = Number(team.birthTeamSlot || team.teamSlot) === 1
  const leagueLevel = Number(team.league?.leagueLevel || team.leagueLevel)
  const clubLevel = Number(club?.clubLevel)
  const known = primary && leagueLevel > 0 && clubLevel > 0
  const delta = known ? leagueLevel - clubLevel : null
  const active = known && Math.abs(delta) >= TEAM_SIGNAL_CALIBRATION.clubGap.levelDifference

  return {
    level: !known ? null : active ? TEAM_SIGNAL_CALIBRATION.clubGap.signalLevel : 0,
    availability: known ? 'available' : 'unavailable',
    reason: !primary ? 'primary_team_required'
      : !(clubLevel > 0) ? 'club_level_missing'
        : !(leagueLevel > 0) ? 'league_level_missing' : null,
    leagueLevel: known ? leagueLevel : null,
    clubLevel: known ? clubLevel : null,
    delta,
    direction: active ? delta < 0 ? 'above' : 'below' : null,
  }
}
