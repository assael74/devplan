// src/features/reports/playerTargets/presentation/buildPlayerTargetsViewModel.js

import playerImage from '../../../../ui/core/images/playerImage.jpg'

import {
  buildPlayerTargetProfile,
  buildPlayerTargetsState,
  resolvePlayerPosition,
} from '../../../../shared/players/targets/index.js'

import {
  buildPlayerTargetSections,
} from './shared/playerTargetSections.js'

const EMPTY = '—'

function resolvePlayerName(player = {}) {
  return (
    player.playerFullName ||
    player.fullName ||
    player.name ||
    [player.playerFirstName, player.playerLastName].filter(Boolean).join(' ') ||
    player.playerShortName ||
    'שחקן'
  )
}

function resolveTeamName(player = {}, team = {}) {
  return (
    team.teamName ||
    team.name ||
    player.teamName ||
    player?.team?.teamName ||
    player?.team?.name ||
    EMPTY
  )
}

function resolveTeamDisplayName(player = {}, team = {}) {
  const name = resolveTeamName(player, team)
  const year = (
    team.teamYear ||
    team.year ||
    team.birthYear ||
    player.teamYear ||
    player?.team?.teamYear ||
    ''
  )

  if (!year || String(name).includes(String(year))) {
    return name
  }

  return `${name} - ${year}`
}

function resolveClubName(player = {}, team = {}) {
  return (
    team?.club?.clubName ||
    team?.club?.name ||
    team.clubName ||
    player?.club?.clubName ||
    player?.club?.name ||
    player.clubName ||
    EMPTY
  )
}

function resolveBirthYear(player = {}) {
  if (player.year) return player.year
  if (player.birthYear) return player.birthYear

  const birth = String(player.birth || '').trim()

  if (!birth) return EMPTY

  const parts = birth.split('-')

  return parts[parts.length - 1] || EMPTY
}

function resolveCoachName(team = {}) {
  const rules = Array.isArray(team.rules) ? team.rules : []
  const roles = Array.isArray(team.roles) ? team.roles : []
  const coach = (
    rules.find(person => person?.type === 'coach') ||
    roles.find(person => person?.type === 'coach')
  )

  return (
    coach?.coachName ||
    coach?.fullName ||
    coach?.name ||
    [coach?.firstName, coach?.lastName].filter(Boolean).join(' ') ||
    EMPTY
  )
}

function buildProfileSummary(profile = {}) {
  if (profile.layerKey === 'goalkeeper') {
    return {
      title: 'פרופיל שוער',
      value: 'אחריות על מניעת ספיגה',
    }
  }

  if (profile.layerKey === 'defense' || profile.layerKey === 'dmMid') {
    return {
      title: 'פרופיל יעד הגנתי',
      value: 'אחריות הגנתית ותרומה קבוצתית',
    }
  }

  return {
    title: 'פרופיל היעד לעונה',
    value: profile.goalTierLabel || EMPTY,
  }
}

function withPresentation(model, options = {}) {
  const presentation = options.presentation || 'url'
  const isMobile = options.isMobile === true || options.device === 'mobile'

  return {
    ...model,
    presentation,
    isMobile,
    isPdf: presentation === 'pdf' || presentation === 'print',
    isUrl: presentation === 'url',
    hasContent: model.hasTargets === true,
  }
}

function buildLegacyViewModel(document = {}, options = {}) {
  const legacy = document.legacyViewModel || {}

  return withPresentation({
    ...legacy,
    player: legacy.player || document.playerSnapshot || {},
    team: legacy.team || document.teamSnapshot || {},
    reportDate: legacy.reportDate || document.generatedAt || '',
    hasTargets: legacy.hasTargets === true || legacy?.profile?.hasBenchmark === true,
  }, options)
}

export function buildPlayerTargetsViewModel(document = {}, options = {}) {
  if (document.legacyViewModel) {
    return buildLegacyViewModel(document, options)
  }

  const player = document.playerSnapshot || {}
  const team = document.teamSnapshot || player.team || {}
  const targets = buildPlayerTargetsState({ player, team })
  const profile = buildPlayerTargetProfile({ player, team })
  const sections = buildPlayerTargetSections({ profile, targets })
  const position = resolvePlayerPosition(player)
  const labels = targets?.labels || {}

  return withPresentation({
    hasTargets: profile?.hasBenchmark === true,
    reportDate: document.generatedAt || '',
    player,
    team,
    entity: {
      type: 'player',
      name: resolvePlayerName(player),
      avatarUrl: player.photo || player.avatarUrl || player.imageUrl || playerImage,
    },
    playerName: resolvePlayerName(player),
    teamName: resolveTeamName(player, team),
    teamDisplayName: resolveTeamDisplayName(player, team),
    clubName: resolveClubName(player, team),
    birthYear: resolveBirthYear(player),
    season: team.season || player.season || player?.team?.season || '',
    coachName: resolveCoachName(team),
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
    profileSummary: buildProfileSummary(profile),
    primarySection: sections.primary,
    usageSection: sections.usage,
    profile,
    targets,
  }, options)
}
