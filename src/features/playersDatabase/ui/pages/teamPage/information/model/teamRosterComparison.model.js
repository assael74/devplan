// src/features/playersDatabase/ui/pages/teamPage/information/model/teamRosterComparison.model.js

import { buildPositionClassificationRows } from '../../positionClassification/model/teamPositionClassificationRows.model.js'

export const ROSTER_COMPARISON_SEASONS = { current: '26/27', previous: '25/26' }

const identityKeys = player => [
  player?.playerId, player?.playerDocumentId, player?.externalPlayerId, player?.id,
].filter(value => value !== undefined && value !== null && value !== '')
  .map(value => String(value).trim()).filter(Boolean)

const difference = (current, previous) => (
  Number.isFinite(current) && Number.isFinite(previous) ? current - previous : null
)

const lineKey = row => row?.isGoalkeeper ? 'GOALKEEPER' : row?.classification?.line || ''

export const buildTeamRosterComparisonRows = ({ current, previous } = {}) => {
  const buildRows = context => buildPositionClassificationRows({
    seasonDoc: context?.season,
    players: context?.players || [],
  })
  const previousRows = buildRows(previous)
  const lookup = new Map()
  previousRows.forEach(row => {
    identityKeys(row.player).forEach(key => {
      if (!lookup.has(key)) lookup.set(key, new Set())
      lookup.get(key).add(row)
    })
  })

  return buildRows(current).map((row, index) => {
    // A name or a generated row index must never match two seasonal players.
    const matches = new Set(identityKeys(row.player).flatMap(key => [...(lookup.get(key) || [])]))
    const prior = matches.size === 1 ? [...matches][0] : null
    const currentLine = lineKey(row)
    const previousLine = lineKey(prior)
    const goalsChange = difference(row.comparisonGoals, prior?.comparisonGoals)

    return {
      ...row,
      comparisonKey: `${row.id}-${index}`,
      previous: prior,
      changes: {
        minutes: difference(row.minutes, prior?.minutes),
        minutesRate: difference(row.minutesRate, prior?.minutesRate),
        goals: goalsChange === null ? null : Number(goalsChange.toFixed(3)),
        line: currentLine && previousLine ? currentLine !== previousLine : null,
      },
    }
  })
}
