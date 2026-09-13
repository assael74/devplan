// src/features/playersDatabase/ui/pages/playerPage/logic/playerScoutView.js

import { buildContext, buildTrajectory } from './playerScoutContextView.js'
import { resolveCurrentSeasonContext } from './playerPage.utils.js'
import { buildImmediacyFactors } from './playerScoutImmediacyView.js'
import {
  isCoreProfile,
  resolveProfileId,
} from './playerScoutProfileIdentity.js'
import { buildProfilesView } from './playerScoutProfiles.view.js'
import {
  buildMainReasons,
  buildProfileStrengthDetails,
  buildWhyView,
} from './playerScoutEvidence.view.js'
import { buildQuestions } from './playerScoutQuestionsView.js'
import { buildBadges, buildDataDepth, buildNextActions } from './playerScoutSupportView.js'
import { ACTION_COLORS, ACTION_LABELS, ACTION_NOTES } from './playerScoutView.constants.js'
import { clean, formatRate, toNumber } from './playerScoutView.utils.js'

export const resolveScoutRow = (rows, selectedSeasonKey) => {
  const safeRows = Array.isArray(rows) ? rows : []

  if (selectedSeasonKey) {
    return safeRows.find(row => row.seasonKey === selectedSeasonKey) || {}
  }

  return resolveCurrentSeasonContext(safeRows)
}

export const buildSeasonStats = row => {
  const games = Number(row.games || 0)
  const goals = Number(row.goals || 0)

  return [
    {
      label: 'משחקים',
      value: games,
    },
    {
      label: 'שערים',
      value: goals,
    },
    {
      label: 'דקות',
      value: Number(row.minutes || 0),
    },
    {
      label: 'פתיחות',
      value: Number(row.starts || 0),
    },
    {
      label: 'שערים למשחק',
      value: games ? formatRate(goals / games) : '-',
    },
    {
      label: 'פרופילים',
      value: Number(row.scoutProfileCount || 0),
    },
  ]
}


export const buildPlayerScoutView = ({ player, historyRows, selectedSeasonKey, selectedRow = null }) => {
  const row = selectedRow || resolveScoutRow(historyRows, selectedSeasonKey)
  const scout = row.scout || {}
  const opportunity = scout.opportunity || {}
  const rawProfiles = Array.isArray(scout.profiles)
    ? scout.profiles
    : Array.isArray(row.scoutProfiles)
      ? row.scoutProfiles
      : []
  const profiles = opportunity.profilesRemoved === true ? [] : rawProfiles
  const profileHierarchy = scout.profileHierarchy && typeof scout.profileHierarchy === 'object'
    ? scout.profileHierarchy
    : row.scoutProfileHierarchy || {}
  const primaryProfileId = clean(profileHierarchy.primaryProfileId)
  const hierarchyPrimaryProfile = profiles.find(
    profile => resolveProfileId(profile) === primaryProfileId
  ) || profileHierarchy.primarySignal || null
  const primaryProfile = isCoreProfile(hierarchyPrimaryProfile)
    ? hierarchyPrimaryProfile
    : profiles.find(isCoreProfile) || null
  const effectiveActionStatus = clean(opportunity.effectiveActionStatus) || 'unknown'
  const context = buildContext(primaryProfile)
  const questions = buildQuestions(scout)
  const reasons = buildMainReasons(primaryProfile)
  const why = buildWhyView(primaryProfile)
  const trajectory = buildTrajectory(scout, historyRows)
  const dataDepth = buildDataDepth({ historyRows, row })
  const profilesView = buildProfilesView({
    ...scout,
    profiles,
    profileHierarchy,
  })
  const immediacyFactors = buildImmediacyFactors(opportunity)
  const immediacyReasons = immediacyFactors.map(item => ({
    id: item.id,
    label: item.label,
  }))
  const manualDecision = opportunity.manualDecision || {}
  const automaticActionStatus = clean(opportunity.automaticActionStatus) || effectiveActionStatus || 'unknown'
  const baseActionStatus = clean(opportunity.baseActionStatus) || 'unknown'
  const interest = {
    status: effectiveActionStatus,
    label: ACTION_LABELS[effectiveActionStatus] || ACTION_LABELS.unknown,
    color: ACTION_COLORS[effectiveActionStatus] || ACTION_COLORS.unknown,
    note: ACTION_NOTES[effectiveActionStatus] || ACTION_NOTES.unknown,
    automaticStatus: automaticActionStatus,
    automaticLabel: ACTION_LABELS[automaticActionStatus] || ACTION_LABELS.unknown,
    baseStatus: baseActionStatus,
    baseLabel: ACTION_LABELS[baseActionStatus] || ACTION_LABELS.unknown,
    isManual: Boolean(opportunity.hasManualDecision || manualDecision.hasDecision),
    manualReason: clean(manualDecision.reason),
    manualNote: clean(manualDecision.note),
    reasons: immediacyReasons,
    factors: immediacyFactors,
    boostScore: toNumber(opportunity.boostScore) || 0,
    reductionScore: toNumber(opportunity.reductionScore) || 0,
    netScore: toNumber(opportunity.netScore) || 0,
    boostCount: immediacyFactors.filter(item => item.type === 'boost').length,
    noChangeCount: immediacyFactors.filter(item => item.type === 'no_change').length,
    reductionCount: immediacyFactors.filter(item => item.type === 'reduction').length,
    notApplicableCount: immediacyFactors.filter(item => item.type === 'not_applicable').length,
  }

  return {
    seasonKey: clean(row.seasonKey || player.seasonKey) || '-',
    identity: {
      playerId: clean(player.playerId || player.id),
      fullName: clean(player.fullName) || 'שחקן',
      avatarUrl: clean(player.avatarUrl),
      clubName: clean(row.clubName || player.clubName),
      clubId: clean(row.clubId || player.clubId),
      teamName: clean(row.teamName || player.teamName),
      teamId: clean(row.teamId || player.teamId),
      leagueName: clean(row.leagueName || player.leagueName),
    },
    dataDepth,
    profiles: profilesView,
    hasScoutData: Boolean(primaryProfile || profiles.length || scout.opportunity),
    seasonStats: buildSeasonStats(row),
    evidenceCards: why.evidence,
    why,
    badges: buildBadges({ primaryProfile, context, opportunity }),
    interest,
    playerReview: scout.playerReview || {},
    manualDecision,
    profileStrength: {
      depthPct: profilesView.primary?.depthPct !== undefined
        ? profilesView.primary.depthPct
        : null,
      label: profilesView.primary?.depthLabel || '-',
      profileLabel: profilesView.primary?.label || '',
      ...buildProfileStrengthDetails(primaryProfile),
    },
    reasons,
    context,
    trajectory,
    questions,
    nextActions: buildNextActions({ player, row }),
    supportingProfiles: profilesView.supporting,
  }
}
