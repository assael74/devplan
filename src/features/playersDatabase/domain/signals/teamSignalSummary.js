// src/features/playersDatabase/domain/signals/teamSignalSummary.js

import { TEAM_SIGNAL_CALIBRATION } from '../../../../shared/scouting/teams/signals/teamSignalCalibration.js'
import { mergeSignalAvailability, readSignalAvailability } from './teamSignalAvailability.js'

export const TEAM_SIGNAL_MODEL_VERSION = 'team-signals-v1'

export const TEAM_SIGNAL_FAMILIES = Object.freeze([
  { id: 'performance', label: 'ביצועי השנתון', iconId: 'stats' },
  { id: 'roster-balance', label: 'איזון הסגל', iconId: 'scouting' },
  { id: 'year-movements', label: 'תנועת השנתון', iconId: 'swapVert' },
  { id: 'future-competition', label: 'צפי התחרות', iconId: 'league' },
  { id: 'club-gap', label: 'השנתון במועדון', iconId: 'players' },
])

export const buildTeamSignalFamily = ({ id, signals = [], availability = null, level = null }) => {
  const resolvedAvailability = availability
    ? readSignalAvailability(availability)
    : mergeSignalAvailability(signals.map(signal => signal.availability))
  const active = signals.filter(signal => Number(signal.level) > 0)
  const resolvedLevel = level !== null ? level
    : active.length ? Math.max(...active.map(signal => signal.level))
      : resolvedAvailability === 'available' ? 0 : null

  return {
    id,
    level: resolvedLevel,
    availability: resolvedAvailability,
    signalsById: Object.fromEntries(signals.map(signal => [signal.id, signal])),
  }
}

export const buildTeamSignalSummary = ({ familiesById = {}, computedAt = null } = {}) => ({
  modelVersion: TEAM_SIGNAL_MODEL_VERSION,
  calibrationVersion: TEAM_SIGNAL_CALIBRATION.version,
  computedAt,
  familiesById: Object.fromEntries(TEAM_SIGNAL_FAMILIES.map(({ id }) => {
    const family = familiesById[id]
    const availability = readSignalAvailability(family?.availability)
    const level = family && [0, 1, 2].includes(family.level) &&
      (family.level > 0 || availability === 'available') ? family.level : null
    return [id, { level, availability }]
  })),
})

export const readTeamSignalSummary = summary => {
  if (summary?.modelVersion !== TEAM_SIGNAL_MODEL_VERSION ||
    summary?.calibrationVersion !== TEAM_SIGNAL_CALIBRATION.version) return buildTeamSignalSummary()
  return buildTeamSignalSummary({ familiesById: summary.familiesById, computedAt: summary.computedAt })
}

export const hasActiveTeamSignals = summary => Object.values(readTeamSignalSummary(summary).familiesById)
  .some(family => family.level > 0)

export const readTeamSignalStrength = summary => {
  const families = Object.values(readTeamSignalSummary(summary).familiesById)
  if (families.some(family => family.level === 2)) return 'strong'
  if (families.some(family => family.level === 1)) return 'watch'
  return families.every(family => family.level === 0 && family.availability === 'available')
    ? 'none' : 'uncovered'
}

export const countTeamSignalStrengths = (summaries = []) => {
  const counts = { strong: 0, watch: 0, none: 0, uncovered: 0 }
  summaries.forEach(summary => { counts[readTeamSignalStrength(summary)] += 1 })
  return counts
}

export const groupTeamsByResearchWork = (teams = []) => {
  const groups = {
    pendingStrong: [],
    pendingWatch: [],
    markedInvestigation: [],
    missingSignalInformation: [],
  }
  for (const team of teams) {
    const strength = readTeamSignalStrength(team.teamSignalSummary)
    if (strength === 'strong' || strength === 'watch') {
      const key = team.showInvestigationIndicator === true ? 'markedInvestigation'
        : strength === 'strong' ? 'pendingStrong' : 'pendingWatch'
      groups[key].push(team)
    } else if (strength === 'uncovered') groups.missingSignalInformation.push(team)
  }
  return groups
}

export const readTeamStrongSignalCount = summary => Object.values(readTeamSignalSummary(summary).familiesById)
  .filter(family => family.level === 2).length

export const TEAM_STRONG_SIGNAL_MINIMUMS = [1, 2, 3]

export const groupTeamsByStrongSignalMinimum = (teams = []) => {
  const groups = Object.fromEntries(TEAM_STRONG_SIGNAL_MINIMUMS.flatMap(minimum => [
    [`strongMin${minimum}`, []], [`strongMin${minimum}Pending`, []],
  ]))
  for (const team of teams) {
    const count = readTeamStrongSignalCount(team.teamSignalSummary)
    for (const minimum of TEAM_STRONG_SIGNAL_MINIMUMS) {
      if (count < minimum) continue
      const key = `strongMin${minimum}`
      groups[key].push(team)
      if (team.showInvestigationIndicator !== true) groups[`${key}Pending`].push(team)
    }
  }
  return groups
}

export const groupTeamsByStrongSignalCount = (teams = []) => {
  const groups = {
    strong1: [], strong2: [], strong3Plus: [],
    strong1Marked: [], strong2Marked: [], strong3PlusMarked: [],
  }
  for (const team of teams) {
    const count = readTeamStrongSignalCount(team.teamSignalSummary)
    if (!count) continue
    const key = count === 1 ? 'strong1' : count === 2 ? 'strong2' : 'strong3Plus'
    groups[key].push(team)
    if (team.showInvestigationIndicator === true) groups[`${key}Marked`].push(team)
  }
  return groups
}

export const mergeTeamSignalSummaries = (summaries = []) => buildTeamSignalSummary({
  computedAt: summaries.map(summary => readTeamSignalSummary(summary).computedAt).filter(Boolean).sort()[0] || null,
  familiesById: Object.fromEntries(TEAM_SIGNAL_FAMILIES.map(({ id }) => [id, buildTeamSignalFamily({
    id,
    signals: summaries.map((summary, index) => ({
      id: String(index),
      ...readTeamSignalSummary(summary).familiesById[id],
    })),
  })])),
})

export const countTeamSignalFamilies = (summaries = []) => {
  const current = summaries.map(readTeamSignalSummary)
  const merged = mergeTeamSignalSummaries(current)
  return Object.fromEntries(TEAM_SIGNAL_FAMILIES.map(({ id }) => {
    const families = current.map(summary => summary.familiesById[id])
    const activeCount = families.filter(family => family.level > 0).length
    const family = merged.familiesById[id]
    return [id, {
      activeTeamCount: activeCount || (family.availability === 'available' ? 0 : null),
      maxLevel: family.level,
      availability: family.availability,
      completeTeamCount: families.filter(item => item.availability === 'available').length,
      partialTeamCount: families.filter(item => item.availability === 'partial').length,
      missingTeamCount: families.filter(item => item.availability === 'unavailable').length,
    }]
  }))
}
