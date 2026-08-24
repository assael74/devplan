// C:\projects\devplan\functions\src\domain\narrative\evidence.js

const {
  buildPlayerInTeamSnapshot,
  buildTeamScoutSnapshot,
} = require('./relationship')

function clean(value) {
  return String(value || '').trim()
}

function cleanUserLabel(value) {
  return clean(value)
    .replace(/סיגנלים/g, 'סימנים')
    .replace(/סיגנאלים/g, 'סימנים')
    .replace(/סיגנל/g, 'סימן')
    .replace(/סיגנאל/g, 'סימן')
    .replace(/המנוע/g, 'מודל הסקאוט')
    .replace(/מנוע/g, 'מודל הסקאוט')
}

function normalizeVerificationEvidence(value = null) {
  if (!value || typeof value !== 'object') return value

  const normalizeCheck = check => ({
    ...check,
    label: cleanUserLabel(check?.label),
  })

  return {
    ...value,
    nextBestCheck: value.nextBestCheck ? normalizeCheck(value.nextBestCheck) : null,
    checks: Array.isArray(value.checks) ? value.checks.map(normalizeCheck) : [],
    missingChecks: Array.isArray(value.missingChecks)
      ? value.missingChecks.map(normalizeCheck)
      : [],
    answeredChecks: Array.isArray(value.answeredChecks)
      ? value.answeredChecks.map(normalizeCheck)
      : [],
  }
}

function addEvidence(list, item) {
  if (!item.id) return
  if (item.value === null || item.value === undefined || item.value === '') return
  list.push(item)
}

function resolveDisplayPercent(metric, actual) {
  if (clean(metric) !== 'minutesPct') return null

  const numeric = Number(actual)
  if (!Number.isFinite(numeric)) return null

  const percent = numeric <= 1.5 ? numeric * 100 : numeric
  return Math.min(100, Math.max(0, Math.round(percent)))
}

function addProfileMatchEvidence(evidence, prefix, profile = {}, meta = {}) {
  const profileId = clean(profile.profileId)
  if (!profileId) return

  addEvidence(evidence, {
    id: `${prefix}.profile.${profileId}.label`,
    type: 'profile',
    value: clean(profile.profileLabel || profileId),
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.profile.${profileId}.strength`,
    type: 'profile_strength',
    value: profile.profileStrength || null,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.profile.${profileId}.identity`,
    type: 'profile_identity',
    value: clean(profile.profileIdentity),
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.profile.${profileId}.shortLabel`,
    type: 'profile',
    value: clean(profile.profileShortLabel),
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.profile.${profileId}.requiredReview`,
    type: 'review_requirements',
    value: Array.isArray(profile.requiredReview) && profile.requiredReview.length
      ? profile.requiredReview
      : null,
    ...meta,
  })

  const matches = Array.isArray(profile.matchEvidence)
    ? profile.matchEvidence.filter(item => item && item.matched)
    : []

  matches.forEach((item, index) => {
    addEvidence(evidence, {
      id: `${prefix}.profile.${profileId}.match.${index}`,
      type: 'profile_match',
      value: {
        metric: clean(item.metric),
        actual: item.actual,
        displayPercent: resolveDisplayPercent(item.metric, item.actual),
        op: clean(item.op),
        threshold: item.threshold,
        reason: clean(item.reason),
        matched: true,
      },
      ...meta,
    })
  })
}

function addScoutSideEvidence(evidence, prefix, side, snapshot, meta = {}) {
  if (!snapshot) return

  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.target`,
    type: 'team_context',
    value: snapshot.target,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.ranking`,
    type: 'team_context',
    value: snapshot.ranking,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.anomaly`,
    type: 'team_context',
    value: snapshot.anomaly,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.quality`,
    type: 'team_context',
    value: snapshot.quality,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.priority`,
    type: 'team_context',
    value: snapshot.priority,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.opportunityType`,
    type: 'team_context',
    value: clean(snapshot.opportunityType),
    ...meta,
  })
}

function addPlayerInTeamEvidence(evidence, prefix, snapshot, meta = {}) {
  addEvidence(evidence, {
    id: `${prefix}.playerInTeam.appearanceRate`,
    type: 'ratio',
    value: snapshot.appearanceRate,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.playerInTeam.startRate`,
    type: 'ratio',
    value: snapshot.startRate,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.playerInTeam.startShareOfAppearances`,
    type: 'ratio',
    value: snapshot.startShareOfAppearances,
    ...meta,
  })
  addEvidence(evidence, {
    id: `${prefix}.playerInTeam.goalShare`,
    type: 'ratio',
    value: snapshot.goalShare,
    ...meta,
  })
}

function addImmediacyEvidence(evidence, decision = {}) {
  addEvidence(evidence, {
    id: 'decision.actionStatus',
    type: 'immediacy',
    value: clean(decision.actionStatus),
  })
  addEvidence(evidence, {
    id: 'decision.automaticActionStatus',
    type: 'immediacy',
    value: clean(decision.automaticActionStatus),
  })
  addEvidence(evidence, {
    id: 'decision.manualActionStatus',
    type: 'immediacy',
    value: clean(decision.manualActionStatus),
  })
  addEvidence(evidence, {
    id: 'decision.hasManualDecision',
    type: 'boolean',
    value: Boolean(decision.hasManualDecision),
  })
  addEvidence(evidence, {
    id: 'decision.boosts',
    type: 'immediacy_factors',
    value: Array.isArray(decision.boosts) && decision.boosts.length
      ? decision.boosts
      : null,
  })
  addEvidence(evidence, {
    id: 'decision.reductions',
    type: 'immediacy_factors',
    value: Array.isArray(decision.reductions) && decision.reductions.length
      ? decision.reductions
      : null,
  })
  addEvidence(evidence, {
    id: 'decision.signalPersistence',
    type: 'persistence',
    value: decision.signalPersistence || null,
  })
}

function buildEvidence(context = {}, decision = {}) {
  const evidence = []
  const entries = Array.isArray(context.entries) ? context.entries : []

  entries.forEach((entry, index) => {
    const seasonKey = clean(entry.seasonKey || entry.seasonId || index)
    const prefix = `season.${seasonKey}`
    const stats = entry.stats || {}
    const teamScoutSnapshot = buildTeamScoutSnapshot(entry)
    const playerInTeamSnapshot = buildPlayerInTeamSnapshot(entry)
    const isDecisionSeason = seasonKey === clean(decision.seasonKey)
    const meta = {
      seasonKey,
      temporalRole: isDecisionSeason ? 'focus' : clean(entry.temporalRole || 'history'),
      seasonStatus: clean(entry.seasonStatus),
      isDecisionSeason,
    }

    addEvidence(evidence, { id: `${prefix}.games`, type: 'number', value: stats.games, ...meta })
    addEvidence(evidence, { id: `${prefix}.goals`, type: 'number', value: stats.goals, ...meta })
    addEvidence(evidence, { id: `${prefix}.minutes`, type: 'number', value: stats.minutes, ...meta })
    addEvidence(evidence, { id: `${prefix}.starts`, type: 'number', value: stats.starts, ...meta })
    addEvidence(evidence, { id: `${prefix}.teamGames`, type: 'number', value: stats.teamGames, ...meta })
    addEvidence(evidence, { id: `${prefix}.teamGoalsFor`, type: 'number', value: stats.teamGoalsFor, ...meta })
    addEvidence(evidence, { id: `${prefix}.teamGoalsAgainst`, type: 'number', value: stats.teamGoalsAgainst, ...meta })
    addEvidence(evidence, { id: `${prefix}.teamRank`, type: 'number', value: stats.teamRank, ...meta })
    addEvidence(evidence, { id: `${prefix}.leagueLevel`, type: 'number', value: entry.leagueLevel, ...meta })
    addEvidence(evidence, { id: `${prefix}.clubStrengthLevel`, type: 'number', value: entry.clubStrengthLevel, ...meta })

    addScoutSideEvidence(evidence, prefix, 'attack', teamScoutSnapshot.attack, meta)
    addScoutSideEvidence(evidence, prefix, 'defense', teamScoutSnapshot.defense, meta)
    addPlayerInTeamEvidence(evidence, prefix, playerInTeamSnapshot, meta)

    if (entry.isPlayingUp !== null) {
      addEvidence(evidence, {
        id: `${prefix}.isPlayingUp`,
        type: 'boolean',
        value: entry.isPlayingUp,
        ...meta,
      })
    }

    const profiles = Array.isArray(entry.profiles) ? entry.profiles : []
    profiles.forEach(profile => addProfileMatchEvidence(evidence, prefix, profile, meta))

    addEvidence(evidence, {
      id: `${prefix}.profileCaseStrength`,
      type: 'profile_case_strength',
      value: entry.profileCaseStrength || null,
      ...meta,
    })
    addEvidence(evidence, {
      id: `${prefix}.progression`,
      type: 'profile_progression',
      value: entry.progression || null,
      ...meta,
    })
    addEvidence(evidence, {
      id: `${prefix}.trajectory`,
      type: 'trajectory',
      value: entry.trajectory || null,
      ...meta,
    })
    addEvidence(evidence, {
      id: `${prefix}.verification`,
      type: 'verification',
      value: normalizeVerificationEvidence(entry.verification),
      ...meta,
    })
    addEvidence(evidence, {
      id: `${prefix}.scoutEvidence`,
      type: 'scout_evidence',
      value: Array.isArray(entry.scoutEvidence) && entry.scoutEvidence.length
        ? entry.scoutEvidence
        : null,
      ...meta,
    })
  })

  addImmediacyEvidence(evidence, decision)
  addEvidence(evidence, {
    id: 'decision.futureOutlook',
    type: 'future_competition',
    value: clean(decision.futureOutlook),
  })
  addEvidence(evidence, {
    id: 'decision.futureCompetitionPath',
    type: 'future_competition',
    value: decision.futureCompetitionPath || null,
  })
  addEvidence(evidence, {
    id: 'decision.currentCompetitionLevel',
    type: 'number',
    value: decision.currentCompetitionLevel,
  })
  addEvidence(evidence, {
    id: 'decision.nextCompetitionLevel',
    type: 'number',
    value: decision.nextCompetitionLevel,
  })
  addEvidence(evidence, {
    id: 'player.review',
    type: 'player_review',
    value: context.playerReview || null,
  })
  addEvidence(evidence, {
    id: 'player.verification',
    type: 'verification',
    value: normalizeVerificationEvidence(context.verification),
  })

  return evidence.sort((left, right) => {
    const leftFocus = left?.isDecisionSeason === true ? 1 : 0
    const rightFocus = right?.isDecisionSeason === true ? 1 : 0
    return rightFocus - leftFocus
  })
}

module.exports = { buildEvidence }
