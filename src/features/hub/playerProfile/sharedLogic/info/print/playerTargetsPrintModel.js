// src/features/hub/playerProfile/sharedLogic/info/print/playerTargetsPrintModel.js

import {
  buildPlayerTargetProfile,
  buildPlayerTargetsState,
  resolvePlayerPosition,
} from '../../../../../../shared/players/targets/index.js'

import { buildPlayerTargetSections } from '../targets.cards.js'

const EMPTY = '—'

const resolvePlayerName = player => {
  return (
    player?.playerFullName ||
    player?.fullName ||
    player?.name ||
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ') ||
    player?.playerShortName ||
    'שחקן'
  )
}

const resolveTeamName = (player, team) => {
  return (
    team?.teamName ||
    team?.name ||
    player?.teamName ||
    player?.team?.teamName ||
    player?.team?.name ||
    EMPTY
  )
}

const resolveTeamYear = (player, team) => {
  return (
    team?.teamYear ||
    team?.year ||
    team?.birthYear ||
    player?.teamYear ||
    player?.team?.teamYear ||
    ''
  )
}

const resolveTeamDisplayName = (player, team) => {
  const name = resolveTeamName(player, team)
  const year = resolveTeamYear(player, team)

  if (!year || String(name).includes(String(year))) return name

  return `${name} - ${year}`
}

const resolveClubName = (player, team) => {
  return (
    team?.club?.clubName ||
    team?.club?.name ||
    team?.clubName ||
    player?.club?.clubName ||
    player?.club?.name ||
    player?.clubName ||
    EMPTY
  )
}

const resolveBirthYear = player => {
  if (player?.year) return player.year
  if (player?.birthYear) return player.birthYear

  const birth = String(player?.birth || '').trim()
  if (!birth) return EMPTY

  return birth.split('-').at(-1) || EMPTY
}

const resolveSeason = (player, team) => {
  return team?.season || player?.season || player?.team?.season || '2026/2027'
}

const resolveCoachName = team => {
  const rules = Array.isArray(team?.rules) ? team.rules : []
  const roles = Array.isArray(team?.roles) ? team.roles : []
  const coach =
    rules.find(person => person?.type === 'coach') ||
    roles.find(person => person?.type === 'coach')

  return (
    coach?.coachName ||
    coach?.fullName ||
    coach?.name ||
    [coach?.firstName, coach?.lastName].filter(Boolean).join(' ') ||
    EMPTY
  )
}

const buildProfileSummary = profile => {
  const layerKey = profile?.layerKey || ''

  if (layerKey === 'goalkeeper') {
    return {
      title: 'פרופיל שוער',
      value: 'אחריות על מניעת ספיגה',
    }
  }

  if (layerKey === 'defense' || layerKey === 'dmMid') {
    return {
      title: 'פרופיל יעד הגנתי',
      value: 'אחריות הגנתית ותרומה קבוצתית',
    }
  }

  return {
    title: 'פרופיל היעד לעונה',
    value: profile?.goalTierLabel || EMPTY,
  }
}

export function buildPlayerTargetsPrintModel({ player = {}, team = {}, reportDate } = {}) {
  const activeTeam = team || player?.team || {}
  const targets = buildPlayerTargetsState({ player, team: activeTeam })
  const profile = buildPlayerTargetProfile({ player, team: activeTeam })
  const sections = buildPlayerTargetSections({ profile, targets })
  const position = resolvePlayerPosition(player)
  const labels = targets?.labels || {}
  const profileSummary = buildProfileSummary(profile)

  return {
    hasTargets: profile?.hasBenchmark === true,
    reportDate: reportDate || new Date(),

    player,
    team: activeTeam,

    playerName: resolvePlayerName(player),
    teamName: resolveTeamName(player, activeTeam),
    teamDisplayName: resolveTeamDisplayName(player, activeTeam),
    clubName: resolveClubName(player, activeTeam),
    birthYear: resolveBirthYear(player),
    season: resolveSeason(player, activeTeam),
    coachName: resolveCoachName(activeTeam),

    primaryPosition: position?.label || profile?.primaryPosition || EMPTY,
    positionGroupLabel: profile?.positionGroupLabel || labels.position || EMPTY,
    squadRoleLabel: labels.role || EMPTY,
    teamProfileLabel: labels.teamProfile || EMPTY,

    confidence: {
      rated: profile?.confidenceRated === true,
      level: profile?.confidenceLevel || '',
      label: profile?.confidenceLabel || 'לא דורג',
      multiplier: Number(profile?.confidenceMultiplier || 1),
      multiplierLabel: `${Math.round(Number(profile?.confidenceMultiplier || 1) * 100)}%`,
    },

    profileSummary,
    primarySection: sections.primary,
    usageSection: sections.usage,

    profile,
    targets,
  }
}

export function buildPlayerTargetsPrintViewModel({
  inputModel = null,
  player = {},
  team = {},
  reportDate,
} = {}) {
  if (inputModel && typeof inputModel === 'object') {
    return {
      ...inputModel,
      player: inputModel.player || player || {},
      team: inputModel.team || team || {},
      reportDate: inputModel.reportDate || reportDate || new Date(),
      hasTargets: inputModel.hasTargets !== false,
    }
  }

  return buildPlayerTargetsPrintModel({
    player,
    team,
    reportDate,
  })
}
