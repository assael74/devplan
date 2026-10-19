// src/features/playersDatabase/services/audit/signals/compareTeamSignalSummaries.js

import { TEAM_SIGNAL_MODEL_VERSION } from '../../../domain/signals/teamSignalSummary.js'
import { TEAM_SIGNAL_CALIBRATION } from '../../../../../shared/scouting/teams/signals/teamSignalCalibration.js'

const stable = value => {
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
}

const teamSignalSummariesEqual = (left, right) => (
  JSON.stringify(stable(left)) === JSON.stringify(stable(right))
)

export const compareTeamSignalSummaries = ({
  teamId,
  clubId,
  seasonId,
  leagueTeam,
  teamSeason,
  leaguesCenterTeam,
  clubsCenterTeam,
  expectedSummary,
}) => {
  const source = teamSeason?.teamSignalSummary || leagueTeam?.teamSignalSummary
  const targets = { league: leagueTeam, teamSeason, leaguesCenter: leaguesCenterTeam, clubsCenter: clubsCenterTeam }
  const findings = []
  const finding = (field, expected, actual) => ({
    type: 'projection_mismatch', target: 'teamSignals', documentId: teamId,
    teamId, clubId, seasonId, field, expected, actual,
    reason: 'סיכום משפחות האיתותים אינו תואם למקורות, בין המסמכים או לגרסת הכיול',
  })
  if (!source) {
    return Object.values(targets).some(Boolean) ? [finding('teamSignalSummary.missing', {
      modelVersion: TEAM_SIGNAL_MODEL_VERSION, calibrationVersion: TEAM_SIGNAL_CALIBRATION.version,
    }, null)] : []
  }
  if (source.modelVersion !== TEAM_SIGNAL_MODEL_VERSION || source.calibrationVersion !== TEAM_SIGNAL_CALIBRATION.version) {
    findings.push(finding('teamSignalSummary.version', {
      modelVersion: TEAM_SIGNAL_MODEL_VERSION, calibrationVersion: TEAM_SIGNAL_CALIBRATION.version,
    }, { modelVersion: source.modelVersion, calibrationVersion: source.calibrationVersion }))
  }
  if (expectedSummary) {
    const content = summary => ({
      modelVersion: summary.modelVersion,
      calibrationVersion: summary.calibrationVersion,
      familiesById: summary.familiesById,
    })
    if (!teamSignalSummariesEqual(content(expectedSummary), content(source))) {
      findings.push(finding('teamSignalSummary.canonical', content(expectedSummary), content(source)))
    }
  } else if (expectedSummary === null) {
    findings.push({
      ...finding('teamSignalSummary.canonical', 'חישוב זמין ממקורות קנוניים', null),
      reason: 'לא ניתן לחשב סיכום ממקורות הקבוצה; יש לבדוק את המקורות לפני אימות הסיכום',
    })
  }
  Object.entries(targets).forEach(([target, row]) => {
    if (!row) return
    if (!teamSignalSummariesEqual(source, row.teamSignalSummary)) {
      findings.push(finding(`${target}.teamSignalSummary`, source, row.teamSignalSummary || null))
    }
  })
  return findings
}
