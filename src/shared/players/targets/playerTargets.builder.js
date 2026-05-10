// shared/players/targets/playerTargets.builder.js

import {
  buildPlayerDerivedTargets,
} from './playerDerivedTargets.js'

const clean = (value) => {
  return value == null ? '' : String(value).trim()
}

const toTargetNumber = (value) => {
  if (value === undefined || value === null || value === '') return null

  const n = Number(value)

  return Number.isFinite(n) ? n : null
}

const buildEmptyPlayerTargetsState = ({
  raw,
  derivedTargets,
}) => {
  return {
    hasTargets: false,

    role: derivedTargets?.role || null,
    position: derivedTargets?.position || null,

    roleTarget: derivedTargets?.roleTarget || null,
    positionTarget: derivedTargets?.positionTarget || null,
    teamTargets: derivedTargets?.teamTargets || null,

    labels: {
      role: derivedTargets?.role?.label || '',
      position:
        derivedTargets?.position?.layerLabel ||
        derivedTargets?.position?.label ||
        '',
      teamProfile:
        derivedTargets?.teamTargets?.targetProfile?.rankLabel ||
        derivedTargets?.teamTargets?.targetProfile?.shortLabel ||
        derivedTargets?.teamTargets?.targetProfile?.label ||
        '',
    },

    values: {},
    groups: {},
    items: [],

    derivedTargets,
    raw,
  }
}

const buildUsageValues = (explicitTargets = {}) => {
  const usage = explicitTargets?.usage || {}

  return {
    minutesRange: Array.isArray(usage.minutesRange)
      ? usage.minutesRange
      : null,

    startsRange: Array.isArray(usage.startsRange)
      ? usage.startsRange
      : null,
  }
}

const buildAttackValues = (explicitTargets = {}) => {
  const attack = explicitTargets?.attack || {}

  return {
    goalsTarget: toTargetNumber(attack.goalsTarget),
    assistsTarget: toTargetNumber(attack.assistsTarget),
    goalContributionsTarget: toTargetNumber(
      attack.goalContributionsTarget
    ),

    goalsTargetRange: attack.goalsTargetRange || null,
    assistsTargetRange: attack.assistsTargetRange || null,
    goalContributionsTargetRange:
      attack.goalContributionsTargetRange || null,

    goalsPerGameTarget: toTargetNumber(attack.goalsPerGameTarget),
    assistsPerGameTarget: toTargetNumber(attack.assistsPerGameTarget),
    contributionPerGameTarget: toTargetNumber(
      attack.contributionPerGameTarget
    ),

    goalsShareRange: Array.isArray(attack.goalsShareRange)
      ? attack.goalsShareRange
      : null,

    assistsShareRange: Array.isArray(attack.assistsShareRange)
      ? attack.assistsShareRange
      : null,

    contributionShareRange: Array.isArray(
      attack.contributionShareRange
    )
      ? attack.contributionShareRange
      : null,
  }
}

const buildDefenseValues = (explicitTargets = {}) => {
  const defense = explicitTargets?.defense || {}

  return {
    teamGoalsAgainstTarget: toTargetNumber(
      defense.teamGoalsAgainstTarget
    ),

    goalsAgainstPerGameTarget: toTargetNumber(
      defense.goalsAgainstPerGameTarget
    ),

    playerGoalsAgainstTarget: toTargetNumber(
      defense.playerGoalsAgainstTarget
    ),

    playerGoalsAgainstTargetRange:
      defense.playerGoalsAgainstTargetRange || null,

    isDefensivePosition: defense.isDefensivePosition === true,
  }
}

const buildPositionValues = (explicitTargets = {}) => {
  const position = explicitTargets?.position || {}

  return {
    contributionPerGameTarget: toTargetNumber(
      position.contributionPerGameTarget
    ),

    goalsPerGameTarget: toTargetNumber(
      position.goalsPerGameTarget
    ),

    assistsPerGameTarget: toTargetNumber(
      position.assistsPerGameTarget
    ),

    teamGoalsSharePctTarget: toTargetNumber(
      position.teamGoalsSharePctTarget
    ),

    cleanSheetPctTarget: toTargetNumber(
      position.cleanSheetPctTarget
    ),
  }
}

const buildTeamSeasonValues = (explicitTargets = {}) => {
  const teamSeasonTargets = explicitTargets?.teamSeasonTargets || {}

  return {
    points: toTargetNumber(teamSeasonTargets.points),
    pointsRate: toTargetNumber(teamSeasonTargets.pointsRate),
    goalsFor: toTargetNumber(teamSeasonTargets.goalsFor),
    goalsAgainst: toTargetNumber(teamSeasonTargets.goalsAgainst),
    goalDifference: toTargetNumber(teamSeasonTargets.goalDifference),
  }
}

const buildPlayerTargetItems = ({
  values,
}) => {
  return [
    {
      id: 'goalsTarget',
      label: 'יעד שערים',
      value: values.attack.goalsTarget,
      unit: 'goals',
    },
    {
      id: 'assistsTarget',
      label: 'יעד בישולים',
      value: values.attack.assistsTarget,
      unit: 'assists',
    },
    {
      id: 'goalContributionsTarget',
      label: 'יעד מעורבות בשערים',
      value: values.attack.goalContributionsTarget,
      unit: 'contributions',
    },
    {
      id: 'goalsAgainstPerGameTarget',
      label: 'יעד ספיגה למשחק',
      value: values.defense.goalsAgainstPerGameTarget,
      unit: 'goalsAgainst',
    },
    {
      id: 'minutesRange',
      label: 'יעד דקות',
      value: values.usage.minutesRange,
      unit: 'range',
    },
    {
      id: 'startsRange',
      label: 'יעד פתיחות',
      value: values.usage.startsRange,
      unit: 'range',
    },
  ].filter((item) => {
    return item.value !== null && item.value !== undefined && item.value !== ''
  })
}

export function buildPlayerTargetsState({
  player,
  team,
} = {}) {
  const raw = player || {}

  const derivedTargets = buildPlayerDerivedTargets({
    player,
    team,
  })

  const explicitTargets = derivedTargets?.explicitTargets || {}
  const hasTargets = explicitTargets?.meta?.hasExplicitTarget === true

  if (!hasTargets) {
    return buildEmptyPlayerTargetsState({
      raw,
      derivedTargets,
    })
  }

  const values = {
    usage: buildUsageValues(explicitTargets),
    attack: buildAttackValues(explicitTargets),
    defense: buildDefenseValues(explicitTargets),
    position: buildPositionValues(explicitTargets),
    teamSeason: buildTeamSeasonValues(explicitTargets),
  }

  const role = derivedTargets?.role || null
  const position = derivedTargets?.position || null
  const teamTargets = derivedTargets?.teamTargets || null
  const teamProfile = teamTargets?.targetProfile || null

  const items = buildPlayerTargetItems({
    values,
  })

  return {
    hasTargets: true,

    role,
    position,

    roleTarget: derivedTargets?.roleTarget || null,
    positionTarget: derivedTargets?.positionTarget || null,
    teamTargets,

    labels: {
      role: role?.label || '',
      position:
        position?.layerLabel ||
        position?.label ||
        '',

      teamProfile:
        teamProfile?.rankLabel ||
        teamProfile?.shortLabel ||
        teamProfile?.label ||
        '',

      playerTarget:
        [
          role?.label,
          position?.layerLabel || position?.label,
        ]
          .filter(Boolean)
          .join(' · '),
    },

    values,

    groups: {
      usage: values.usage,
      attack: values.attack,
      defense: values.defense,
      position: values.position,
      teamSeason: values.teamSeason,
    },

    items,

    derivedTargets,
    raw,
  }
}
