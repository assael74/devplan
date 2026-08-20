// C:\projects\devplan\functions\src\domain\narrative\evidence.js

const {
  buildPlayerInTeamSnapshot,
  buildTeamScoutSnapshot,
} = require('./relationship')

function clean(value) {
  return String(value || '').trim()
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

function addProfileMatchEvidence(evidence, prefix, profile = {}) {
  const profileId = clean(profile.profileId)
  if (!profileId) return

  addEvidence(evidence, {
    id: `${prefix}.profile.${profileId}.label`,
    type: 'profile',
    value: clean(profile.profileLabel || profileId),
  })
  addEvidence(evidence, {
    id: `${prefix}.profile.${profileId}.strength`,
    type: 'profile_strength',
    value: profile.profileStrength || null,
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
    })
  })
}

function addScoutSideEvidence(evidence, prefix, side, snapshot) {
  if (!snapshot) return

  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.target`,
    type: 'team_context',
    value: snapshot.target,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.ranking`,
    type: 'team_context',
    value: snapshot.ranking,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.anomaly`,
    type: 'team_context',
    value: snapshot.anomaly,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.quality`,
    type: 'team_context',
    value: snapshot.quality,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.priority`,
    type: 'team_context',
    value: snapshot.priority,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.opportunityType`,
    type: 'team_context',
    value: clean(snapshot.opportunityType),
  })
}

function addPlayerInTeamEvidence(evidence, prefix, snapshot) {
  addEvidence(evidence, {
    id: `${prefix}.playerInTeam.appearanceRate`,
    type: 'ratio',
    value: snapshot.appearanceRate,
  })
  addEvidence(evidence, {
    id: `${prefix}.playerInTeam.startRate`,
    type: 'ratio',
    value: snapshot.startRate,
  })
  addEvidence(evidence, {
    id: `${prefix}.playerInTeam.startShareOfAppearances`,
    type: 'ratio',
    value: snapshot.startShareOfAppearances,
  })
  addEvidence(evidence, {
    id: `${prefix}.playerInTeam.goalShare`,
    type: 'ratio',
    value: snapshot.goalShare,
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
    const prefix = `season.${entry.seasonKey || entry.seasonId || index}`
    const stats = entry.stats || {}
    const teamScoutSnapshot = buildTeamScoutSnapshot(entry)
    const playerInTeamSnapshot = buildPlayerInTeamSnapshot(entry)

    addEvidence(evidence, { id: `${prefix}.games`, type: 'number', value: stats.games })
    addEvidence(evidence, { id: `${prefix}.goals`, type: 'number', value: stats.goals })
    addEvidence(evidence, { id: `${prefix}.minutes`, type: 'number', value: stats.minutes })
    addEvidence(evidence, { id: `${prefix}.starts`, type: 'number', value: stats.starts })
    addEvidence(evidence, { id: `${prefix}.teamGames`, type: 'number', value: stats.teamGames })
    addEvidence(evidence, { id: `${prefix}.teamGoalsFor`, type: 'number', value: stats.teamGoalsFor })
    addEvidence(evidence, { id: `${prefix}.teamGoalsAgainst`, type: 'number', value: stats.teamGoalsAgainst })
    addEvidence(evidence, { id: `${prefix}.teamRank`, type: 'number', value: stats.teamRank })
    addEvidence(evidence, { id: `${prefix}.leagueLevel`, type: 'number', value: entry.leagueLevel })
    addEvidence(evidence, { id: `${prefix}.clubStrengthLevel`, type: 'number', value: entry.clubStrengthLevel })

    addScoutSideEvidence(evidence, prefix, 'attack', teamScoutSnapshot.attack)
    addScoutSideEvidence(evidence, prefix, 'defense', teamScoutSnapshot.defense)
    addPlayerInTeamEvidence(evidence, prefix, playerInTeamSnapshot)

    if (entry.isPlayingUp !== null) {
      addEvidence(evidence, {
        id: `${prefix}.isPlayingUp`,
        type: 'boolean',
        value: entry.isPlayingUp,
      })
    }

    const profiles = Array.isArray(entry.profiles) ? entry.profiles : []
    profiles.forEach(profile => addProfileMatchEvidence(evidence, prefix, profile))

    addEvidence(evidence, {
      id: `${prefix}.profileCaseStrength`,
      type: 'profile_case_strength',
      value: entry.profileCaseStrength || null,
    })
    addEvidence(evidence, {
      id: `${prefix}.progression`,
      type: 'profile_progression',
      value: entry.progression || null,
    })
    addEvidence(evidence, {
      id: `${prefix}.trajectory`,
      type: 'trajectory',
      value: entry.trajectory || null,
    })
    addEvidence(evidence, {
      id: `${prefix}.verification`,
      type: 'verification',
      value: entry.verification || null,
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
    value: context.verification || null,
  })

  return evidence
}

module.exports = { buildEvidence }
