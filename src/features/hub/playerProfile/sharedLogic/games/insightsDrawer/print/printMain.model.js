// playerProfile/sharedLogic/games/insightsDrawer/print/printMain.model.js

import {
  buildPrintMetaItem,
  cleanPrintText,
  formatPrintNumber,
  formatPrintPercent,
  formatPrintRange,
  getPrintPlayerName,
  getPrintTeamName,
  normalizePrintCards,
  resolveTargetAchievementColor,
  resolveTargetRangeColor,
} from './print.utils.js'

const getDiagnosis = (model = {}) => {
  return model?.mainDiagnosis || model?.viewModel?.mainDiagnosis || {}
}

const getDiagnosisTitle = (mainDiagnosis = {}) => {
  return cleanPrintText(
    mainDiagnosis?.diagnosis?.title ||
    mainDiagnosis?.title,
    'שורה תחתונה'
  )
}

const getDiagnosisText = (mainDiagnosis = {}) => {
  return cleanPrintText(
    mainDiagnosis?.diagnosis?.text ||
    mainDiagnosis?.text ||
    mainDiagnosis?.summary
  )
}

const getDiagnosisActionText = (mainDiagnosis = {}) => {
  return cleanPrintText(
    mainDiagnosis?.diagnosis?.actionText ||
    mainDiagnosis?.actionText
  )
}

const getPlayer = (model = {}) => {
  return (
    model?.livePlayer ||
    model?.viewModel?.context?.player ||
    {}
  )
}

const getTeam = (model = {}) => {
  return (
    model?.liveTeam ||
    model?.viewModel?.context?.team ||
    {}
  )
}

const getGames = (model = {}) => {
  return (
    model?.insights?.games ||
    model?.viewModel?.games ||
    {}
  )
}

const getReliability = (model = {}, games = {}) => {
  return (
    model?.insights?.reliability ||
    games?.reliability ||
    model?.viewModel?.reliability ||
    {}
  )
}

const getRoleTarget = (model = {}, games = {}) => {
  return (
    model?.insights?.targets?.roleTarget ||
    model?.viewModel?.targets?.roleTarget ||
    games?.targets?.roleTarget ||
    {}
  )
}

const buildMainMetrics = ({
  usage = {},
  roleTarget = {},
  reliability = {},
}) => {
  const minutesPct = Number(usage?.minutesPct)
  const minutesPlayed = usage?.minutesPlayed
  const minutesPossible = usage?.minutesPossible

  const startsPct = usage?.startsPctFromTeamGames
  const starts = usage?.starts

  const gamesIncluded = usage?.gamesIncluded
  const teamGamesTotal = usage?.teamGamesTotal

  const minutesRange = roleTarget?.minutesRange

  return normalizePrintCards([
    {
      id: 'minutesPct',
      title: 'דקות משחק',
      value: formatPrintPercent(minutesPct),
      sub: `${formatPrintNumber(minutesPlayed)} מתוך ${formatPrintNumber(
        minutesPossible
      )} דקות · יעד ${formatPrintRange(minutesRange)}`,
      color: resolveTargetRangeColor({
        actual: minutesPct,
        range: minutesRange,
      }),
    },
    {
      id: 'startsPct',
      title: 'פתח בהרכב',
      value: formatPrintPercent(startsPct),
      sub: `${formatPrintNumber(starts)} מתוך ${formatPrintNumber(
        teamGamesTotal
      )} משחקים`,
      color: resolveTargetAchievementColor({
        actual: startsPct,
        target: 50,
        higherIsBetter: true,
        fallback: 'neutral',
      }),
    },
    {
      id: 'gamesIncluded',
      title: 'שותף במשחק',
      value: `${formatPrintNumber(gamesIncluded)}/${formatPrintNumber(
        teamGamesTotal
      )}`,
      sub: 'משחקי ליגה',
      color: resolveTargetAchievementColor({
        actual: gamesIncluded,
        target: teamGamesTotal,
        higherIsBetter: true,
        goodRatio: 0.9,
        warningRatio: 0.65,
        fallback: 'neutral',
      }),
    },
    {
      id: 'reliability',
      title: 'מהימנות',
      value: reliability?.label || 'לא ידוע',
      sub: reliability?.caution ? 'יש לפרש בזהירות' : 'מדגם תקין',
      color: reliability?.tone || 'neutral',
    },
  ])
}

export const buildPlayerPrintMainModel = (model = {}) => {
  const player = getPlayer(model)
  const team = getTeam(model)
  const games = getGames(model)

  const usage = games?.usage || {}
  const reliability = getReliability(model, games)
  const roleTarget = getRoleTarget(model, games)
  const mainDiagnosis = getDiagnosis(model)

  const playerName = getPrintPlayerName(player)
  const teamName = getPrintTeamName(team)

  return {
    reportType: 'דוח תובנות שחקן',
    title: playerName,
    subtitle: teamName,
    avatarUrl: player?.photo || '',
    documentTitle: teamName
      ? `דוח תובנות שחקן - ${playerName} | ${teamName}`
      : `דוח תובנות שחקן - ${playerName}`,
    producedAtLabel: new Date().toLocaleDateString('he-IL'),

    meta: [
      buildPrintMetaItem({
        id: 'player',
        label: 'שחקן',
        value: playerName,
      }),
      buildPrintMetaItem({
        id: 'team',
        label: 'קבוצה',
        value: teamName || 'לא זמין',
      }),
      buildPrintMetaItem({
        id: 'gamesIncluded',
        label: 'משחקים במדגם',
        value: usage?.gamesIncluded
          ? `${formatPrintNumber(usage.gamesIncluded)}/${formatPrintNumber(
              usage.teamGamesTotal
            )}`
          : '—',
      }),
      buildPrintMetaItem({
        id: 'reliability',
        label: 'מהימנות',
        value: reliability?.label || 'לא ידוע',
        color: reliability?.tone || 'neutral',
      }),
    ],

    main: {
      id: 'mainDiagnosis',
      title: getDiagnosisTitle(mainDiagnosis),
      text: getDiagnosisText(mainDiagnosis),
      actionText: getDiagnosisActionText(mainDiagnosis),
      color: mainDiagnosis?.diagnosis?.tone || 'primary',
      role: mainDiagnosis?.role || null,
      reliability: mainDiagnosis?.reliability || null,

      // בכוונה ריק: מניעת כפילות מתחת לאזור הכחול
      facts: [],

      metrics: buildMainMetrics({
        usage,
        roleTarget,
        reliability,
      }),
    },

    // בכוונה ריק: מניעת שורת כרטיסים כפולה מתחת לאבחנה
    cards: [],
  }
}
