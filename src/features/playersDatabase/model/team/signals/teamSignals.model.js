// src/features/playersDatabase/model/team/signals/teamSignals.model.js

import {
  buildTeamSignalFamily,
  buildTeamSignalSummary,
} from '../../../domain/signals/teamSignalSummary.js'
import { buildMovementSeasonSignal } from '../../../domain/signals/teamMovementSignal.js'
import { buildTeamClubLevelGap } from '../../../domain/signals/teamSignalFacts.js'
import {
  mergeSignalAvailability,
  readCompetitionAvailability,
  readSignalAvailability,
} from '../../../domain/signals/teamSignalAvailability.js'
import { getTeamLineActions } from '../../../../../shared/scouting/teams/interpretation/teamLinePerformanceInterpretation.js'
import { TEAM_SIGNAL_CALIBRATION } from '../../../../../shared/scouting/teams/signals/teamSignalCalibration.js'

const signal = (id, level, availability, subSignalsById = {}) => ({ id, level, availability, subSignalsById })

const buildBalanceFamily = structure => {
  const available = readSignalAvailability(structure?.availability) !== 'unavailable'
  const interest = available ? structure.teamInterest : null
  const signals = ['offense', 'defense'].map(side => {
    const line = interest?.lines?.[side]
    const finding = line?.finding || line?.reason || ''
    const known = available && Boolean(finding)
    return signal(side, !known ? null : line.isInteresting ? 1 : 0, known ? 'available' : 'unavailable',
      finding ? { [finding]: { id: finding, actions: getTeamLineActions(finding) } } : {})
  })
  const squad = interest?.squad
  const squadKnown = available && typeof squad?.isInteresting === 'boolean'
  signals.push(signal('squad', !squadKnown ? null : squad.isInteresting ? 1 : 0,
    squadKnown ? 'available' : 'unavailable', squad?.reason ? {
      [squad.reason]: { id: squad.reason, performanceState: squad.performanceState, actions: squad.actions },
    } : {}))
  const activeCount = signals.filter(item => item.level > 0).length
  return buildTeamSignalFamily({
    id: 'roster-balance', signals,
    level: activeCount ? activeCount >= TEAM_SIGNAL_CALIBRATION.balance.strongSignalCount ? 2 : 1 : null,
  })
}

const buildMovementFamily = (season, clubLevel) => {
  const result = buildMovementSeasonSignal(season, clubLevel)
  const available = result.status !== 'limited'
  const total = season?.outgoingPlayerCount || 0
  const directionComplete = available && (season?.comparableDepartures || 0) >= total
  const profilesComplete = available && (season?.profileKnownDepartures || 0) >= total
  const subSignal = (id, active, complete, count) => ({
    id, count, threshold: result.balancePoint, active,
    level: !available ? null : active ? 1 : complete ? 0 : null,
    availability: !available ? 'unavailable' : complete ? 'available' : 'partial',
  })
  const direction = subSignal('direction', result.directionActive, directionComplete, result.directionDepartureCount)
  direction.includesSameLevel = clubLevel === 1
  const professional = subSignal('professional', result.professionalActive, profilesComplete, result.professionalDepartureCount)
  const availability = mergeSignalAvailability([direction.availability, professional.availability])
  return buildTeamSignalFamily({
    id: 'year-movements',
    signals: [signal('departures', result.count
      ? result.count >= TEAM_SIGNAL_CALIBRATION.movement.strongSignalCount ? 2 : 1
      : availability === 'available' ? 0 : null, availability,
      { direction, professional })],
  })
}

const findCompetition = (view, intelligence) => {
  const teamId = view?.team?.birthTeamId || view?.team?.teamId || view?.team?.id
  const teams = (intelligence?.birthYearTeams || []).flatMap(group => group.seasons?.current?.teams || [])
  const matches = teams.filter(team => team.teamId === teamId)
  return matches.length === 1 ? matches[0].futureCompetition : null
}

const buildCompetitionFamily = (view, intelligence) => {
  const competition = findCompetition(view, intelligence)
  const known = readCompetitionAvailability(competition) === 'available'
  const changed = known && ['up', 'down'].includes(competition.direction)
  return buildTeamSignalFamily({
    id: 'future-competition',
    signals: [signal('level-change', known ? changed ? TEAM_SIGNAL_CALIBRATION.futureCompetition.changedLevel : 0 : null,
      known ? 'available' : 'unavailable',
      known ? {
        [competition.direction]: {
          id: competition.direction, currentLevel: competition.currentLeagueLevel,
          projectedLevel: competition.projectedNextLeagueLevel,
          sourceTeamId: competition.sourceTeamId, status: competition.status,
        },
      } : {})],
  })
}

const buildClubFamily = (view, club, intelligence) => {
  const team = view?.team || {}
  const teamId = team.birthTeamId || team.teamId || team.id
  const source = intelligence?.cohortComparison
  const sameSeason = !view?.selectedSeasonOption?.seasonId ||
    source?.seasonId === view.selectedSeasonOption.seasonId
  const target = sameSeason && (!team.clubId || source?.clubId === team.clubId)
    ? source?.rows?.find(row => row.teamId === teamId) : null
  const primary = Number(team.birthTeamSlot || team.teamSlot) === 1
  const gap = buildTeamClubLevelGap({ team, club })
  const signals = [signal('league-vs-club', gap.level, gap.availability, gap.delta !== null ? {
      gap: { id: 'gap', leagueLevel: gap.leagueLevel, clubLevel: gap.clubLevel, delta: gap.delta },
    } : {})]
  ;['competition', 'performance', 'squad'].forEach(id => {
    const metrics = Object.values(target?.metrics || {}).filter(metric => metric.family === id)
    const active = metrics.some(metric => metric.isAnomaly)
    const availability = mergeSignalAvailability(metrics.map(metric => metric.availability))
    signals.push(signal(`historical-${id}`, active ? id === 'competition' ? 2 : 1
      : availability === 'available' ? 0 : null, availability,
    Object.fromEntries(metrics.map(metric => [metric.key, { id: metric.key, ...metric }]))))
  })
  const gapLevel = signals[0].level || 0
  const historyLevel = primary ? target?.signalLevel || 0 : 0
  const result = Math.max(gapLevel, historyLevel)
  return buildTeamSignalFamily({
    id: 'club-gap', signals, level: result || null,
    availability: source?.unavailableSeasonIds?.length ? 'partial' : null,
  })
}

export const buildTeamSignals = ({ view, club, clubIntelligence, computedAt = null }) => {
  const resolvedClub = club || clubIntelligence?.club || null
  const movementSeason = view?.yearDevelopment?.movementSeasons?.find(season => (
    season.seasonKey === view.selectedSeasonKey
  ))
  const families = [
    buildTeamSignalFamily({ id: 'performance', signals: view?.performanceInsight?.signals || [] }),
    buildBalanceFamily(view?.structure),
    buildMovementFamily(movementSeason, Number(resolvedClub?.clubLevel)),
    buildCompetitionFamily(view, clubIntelligence),
    buildClubFamily(view, resolvedClub, clubIntelligence),
  ]
  const familiesById = Object.fromEntries(families.map(family => [family.id, family]))
  return {
    familiesById,
    summary: buildTeamSignalSummary({ familiesById, computedAt }),
  }
}
