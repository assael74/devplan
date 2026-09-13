import { buildTeamLineInterpretationState } from '../../../../domain/index.js'
import {
  getTeamLineInterestPresentation,
  getTeamSquadActionsPresentation,
  getTeamSquadInterestPresentation,
} from './teamInterest.presentation.js'

import { clean, numberOrNull } from './teamInformation.utils.js'
import { buildBalance } from './teamBalanceInformation.model.js'
import { buildPositionClassificationRows } from './teamPositionClassificationRows.model.js'
import {
  buildDevelopmentTimeline,
  buildPerformance,
  buildPriorityTimeline,
  buildSeasonChange,
  buildSeasonTimeline,
  buildYearDevelopmentOverview,
  findPreviousSeason,
} from './teamInformationDevelopment.model.js'

const buildStructure = ({ seasonDoc, lineInterpretation = null }) => {
  const balance = seasonDoc?.teamBalance
  const interpretation = lineInterpretation || balance?.scoutInterpretation || null
  const structure = balance?.lineStructure
  if (!structure || typeof structure !== 'object') return null

  const lines = structure.lines || {}
  const classifiedPlayers = numberOrNull(structure.classifiedPlayersCount)
  const relevantPlayers = numberOrNull(structure.relevantPlayersCount)
  const unclassifiedSufficientSamplePlayers = numberOrNull(
    structure.unclassifiedSufficientSamplePlayersCount
  )
  const insufficientSamplePlayers = numberOrNull(structure.insufficientSamplePlayersCount)
  const midfieldPlayers = numberOrNull(lines.midfield?.playersCount)
  const percentOfRelevantPlayers = value => (
    relevantPlayers !== null && relevantPlayers > 0 && value !== null
      ? Math.round((value / relevantPlayers) * 100)
      : null
  )

  return {
    availability: interpretation?.availability ||
      balance?.balanceAvailability?.availability ||
      'unavailable',
    availabilityReason: interpretation?.availabilityReason ||
      balance?.balanceAvailability?.availabilityReason ||
      null,
    conclusion: 'מבנה שחקנים מזוהים',
    conclusionDetail: 'הנתונים מתארים את הסיווג העונתי ואת ההשוואה לנקודת ייחוס. הם אינם קובעים צורך, חוסר או הזדמנות סקאוטינג.',
    lines: {
      goalkeeper: numberOrNull(structure.goalkeeperPlayersCount),
      defense: numberOrNull(lines.defense?.playersCount),
      midfield: midfieldPlayers,
      attack: numberOrNull(lines.attack?.playersCount),
      classified: classifiedPlayers,
      unclassifiedSufficientSample: unclassifiedSufficientSamplePlayers,
      insufficientSample: insufficientSamplePlayers,
    },
    rates: {
      classified: percentOfRelevantPlayers(classifiedPlayers),
      unclassifiedSufficientSample: percentOfRelevantPlayers(unclassifiedSufficientSamplePlayers),
      insufficientSample: percentOfRelevantPlayers(insufficientSamplePlayers),
    },
    coverageLabel: classifiedPlayers !== null
        ? `מבוסס על ${classifiedPlayers} שחקנים שסווגו`
        : 'הערכת המבנה מבוססת על השחקנים העומדים בתנאי הסיווג בעונה.',
    benchmark: balance?.lineupBenchmark || null,
    classificationCoverageBenchmark: balance?.classificationCoverageBenchmark || null,
    lineInterpretation: {
      offense: interpretation?.offense || null,
      defense: interpretation?.defense || null,
    },
    teamInterest: interpretation?.teamInterest || null,
    interestPresentation: {
      offense: getTeamLineInterestPresentation(
        interpretation?.teamInterest?.lines?.offense?.reason
      ),
      defense: getTeamLineInterestPresentation(
        interpretation?.teamInterest?.lines?.defense?.reason
      ),
      squad: getTeamSquadInterestPresentation({
        reason: interpretation?.teamInterest?.squad?.reason,
        performanceState: interpretation?.teamInterest?.squad?.performanceState,
      }),
      squadActions: getTeamSquadActionsPresentation(
        interpretation?.teamInterest?.squad?.actions
      ),
    },
    details: [],
  }
}

export const buildTeamInformationView = ({
  team = {},
  teamSeasons = [],
  selectedTeamSeason = null,
  selectedSeasonKey = '',
  selectedSeasonOption = null,
  seasonOptions = [],
  players = [],
} = {}) => {
  const previousSeason = findPreviousSeason({ teamSeasons, selectedSeasonKey })
  const balance = buildBalance({ seasonDoc: selectedTeamSeason })
  const previousBalance = buildBalance({ seasonDoc: previousSeason })
  const positionClassificationRows = buildPositionClassificationRows({
    seasonDoc: selectedTeamSeason,
    players,
  })
  const lineInterpretation = selectedTeamSeason
    ? buildTeamLineInterpretationState({
      teamDocument: team || {},
      seasonDocument: selectedTeamSeason,
      balanceState: selectedTeamSeason.teamBalance || null,
    })
    : null
  const structure = buildStructure({
    seasonDoc: selectedTeamSeason,
    lineInterpretation,
  })

  return {
    team,
    selectedSeasonKey: clean(selectedSeasonKey),
    balance,
    structure,
    positionClassificationRows,
    lineInterpretation,
    performance: buildPerformance(team),
    seasonTimeline: buildSeasonTimeline({ team, teamSeasons, selectedSeasonKey, selectedSeasonOption }),
    developmentTimeline: buildDevelopmentTimeline({ team, teamSeasons, seasonOptions, selectedSeasonKey, selectedSeasonOption }),
    yearDevelopment: buildYearDevelopmentOverview({ team, teamSeasons, seasonOptions, selectedSeasonKey, selectedSeasonOption }),
    offensePriorityTimeline: buildPriorityTimeline({
      side: 'offense', team, teamSeasons, selectedSeasonKey, selectedSeasonOption,
    }),
    defensePriorityTimeline: buildPriorityTimeline({
      side: 'defense', team, teamSeasons, selectedSeasonKey, selectedSeasonOption,
    }),
    previousSeasonKey: clean(previousSeason?.seasonKey || previousSeason?.seasonId),
    seasonChange: buildSeasonChange({ balance, previousBalance, season: selectedTeamSeason, previousSeason }),
  }
}
