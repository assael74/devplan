// src/features/playersDatabase/ui/pages/teamPage/information/model/teamInformation.model.js

import { buildTeamBalanceState, buildTeamLineInterpretationState } from '../../../../../domain/index.js'
import { isPreviousSeasonKey } from '../../../../../domain/movement/index.js'
import {
  getTeamLineInterestPresentation,
  getTeamSquadActionsPresentation,
  getTeamSquadInterestPresentation,
} from '../../scouting/model/teamInterest.presentation.js'

import { clean, numberOrNull } from '../../model/teamInformation.utils.js'
import { buildPositionClassificationRows } from '../../positionClassification/model/teamPositionClassificationRows.model.js'
import {
  buildDevelopmentTimeline,
  buildPerformance,
  buildPriorityTimeline,
  buildSeasonTimeline,
  buildYearDevelopmentOverview,
  findPreviousSeason,
} from './teamInformationDevelopment.model.js'
import { buildTeamPerformanceInsight } from './teamPerformanceInsight.model.js'

const buildStructure = ({ seasonDoc, lineInterpretation = null }) => {
  const balance = seasonDoc?.teamBalance
  const interpretation = balance?.scoutInterpretation || lineInterpretation || null
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

const withCurrentBalance = (seasonDoc, rows = null, context = null) => {
  if (!seasonDoc) return null
  if (!seasonDoc.teamPlayers?.length && seasonDoc.stats?.statsLoadState?.status !== 'loaded') return seasonDoc
  const allRows = rows || buildPositionClassificationRows({ seasonDoc })
  // Cards and filters must consume the same seasonal classifications. Saved
  // balance summaries can predate the current classification model.
  const teamBalance = buildTeamBalanceState({
    seasonDocument: {
      ...seasonDoc,
      teamStats: context?.teamStats || seasonDoc.teamStats,
      performance: context?.performance || seasonDoc.performance,
      teamPlayers: allRows.map(row => ({ ...row.player, lineClassification: row.classification })),
    },
  })
  return { ...seasonDoc, teamBalance }
}

export const buildTeamInformationView = ({
  team = {},
  teamSeasons = [],
  selectedTeamSeason = null,
  selectedSeasonKey = '',
  selectedSeasonOption = null,
  seasonOptions = [],
  clubsDirectory = null,
  players = [],
  playerIdsFilter = null,
} = {}) => {
  const allPositionRows = buildPositionClassificationRows({ seasonDoc: selectedTeamSeason, players })
  const selectedSnapshot = teamSeasons.find(season => (
    clean(season?.seasonKey || season?.seasonId) === clean(selectedSeasonKey)
  ))
  selectedTeamSeason = withCurrentBalance(selectedTeamSeason, allPositionRows, selectedSnapshot)
  teamSeasons = teamSeasons.map(season => withCurrentBalance(season))
  const previousSeason = findPreviousSeason({ teamSeasons, selectedSeasonKey })
  const currentSeason = teamSeasons.find(season => (
    clean(season?.seasonKey || season?.seasonId) === clean(selectedSeasonKey)
  )) || null
  const positionClassificationRows = playerIdsFilter ? buildPositionClassificationRows({
    seasonDoc: selectedTeamSeason,
    players,
    playerIdsFilter,
  }) : allPositionRows
  const persistedLineInterpretation = selectedTeamSeason?.teamBalance?.scoutInterpretation || null
  const lineInterpretation = persistedLineInterpretation || (selectedTeamSeason
    ? buildTeamLineInterpretationState({
      teamDocument: team || {},
      seasonDocument: {
        ...selectedTeamSeason,
        performance: selectedTeamSeason.performance || team.performance || null,
      },
      balanceState: selectedTeamSeason.teamBalance || null,
    })
    : null)
  const structure = buildStructure({
    seasonDoc: selectedTeamSeason,
    lineInterpretation,
  })
  const previousRosterSeasonKey = clean(previousSeason?.seasonKey || previousSeason?.seasonId)
  const comparisonSeason = previousSeason && isPreviousSeasonKey({
    previousSeasonKey: previousRosterSeasonKey,
    seasonKey: selectedSeasonKey,
  }) ? previousSeason : null
  const previousRosterBalance = comparisonSeason ? {
    seasonKey: previousRosterSeasonKey,
    structure: buildStructure({
      seasonDoc: comparisonSeason,
      lineInterpretation: comparisonSeason.teamBalance?.scoutInterpretation || buildTeamLineInterpretationState({
        teamDocument: team,
        seasonDocument: comparisonSeason,
        balanceState: comparisonSeason.teamBalance || null,
      }),
    }),
  } : null

  return {
    team,
    selectedTeamSeason,
    selectedSeasonKey: clean(selectedSeasonKey),
    selectedSeasonOption,
    structure,
    previousRosterBalance,
    allPositionClassificationRows: allPositionRows,
    positionClassificationRows,
    lineInterpretation,
    performance: buildPerformance(team),
    performanceInsight: buildTeamPerformanceInsight({
      team,
      currentSeason,
      previousSeason,
      selectedTeamSeason,
      selectedSeasonOption,
    }),
    seasonTimeline: buildSeasonTimeline({ team, teamSeasons, selectedSeasonKey, selectedSeasonOption }),
    developmentTimeline: buildDevelopmentTimeline({
      team, teamSeasons, seasonOptions, selectedTeamSeason, selectedSeasonKey,
    }),
    yearDevelopment: buildYearDevelopmentOverview({
      team, teamSeasons, seasonOptions, clubsDirectory, selectedSeasonKey,
    }),
    offensePriorityTimeline: buildPriorityTimeline({
      side: 'offense', team, teamSeasons, selectedSeasonKey, selectedSeasonOption,
    }),
    defensePriorityTimeline: buildPriorityTimeline({
      side: 'defense', team, teamSeasons, selectedSeasonKey, selectedSeasonOption,
    }),
    previousSeasonKey: clean(previousSeason?.seasonKey || previousSeason?.seasonId),
  }
}
