// teamProfile/sharedLogic/management/teamManagement.logic.js

const toStr = (v) => String(v ?? '')

function pickTargetsState(team) {
  const t = team || {}
  const targets = t.targets || {}

  const benchmarkTargets = targets.benchmark || targets
  const values = benchmarkTargets.values || targets.values || {}

  return {
    status: benchmarkTargets.status ?? t.status,
    assignedAt: benchmarkTargets.assignedAt ?? t.assignedAt,
    assignedBy: benchmarkTargets.assignedBy ?? t.assignedBy,
    benchmarkLevelId:
      benchmarkTargets.benchmarkLevelId ??
      benchmarkTargets.levelId ??
      t.benchmarkLevelId,

    targetPosition: values.position ?? benchmarkTargets.targetPosition ?? t.targetPosition,
    targetPoints: values.points ?? benchmarkTargets.targetPoints ?? t.targetPoints,
    targetSuccessRate:
      values.successRate ?? benchmarkTargets.targetSuccessRate ?? t.targetSuccessRate,
    targetGoalsFor: values.goalsFor ?? benchmarkTargets.targetGoalsFor ?? t.targetGoalsFor,
    targetGoalsAgainst:
      values.goalsAgainst ?? benchmarkTargets.targetGoalsAgainst ?? t.targetGoalsAgainst,
  }
}

export function buildTeamManagementModel(team) {
  const t = team || {}
  const targets = pickTargetsState(t)

  return {
    // ----- INFO -----
    teamName: toStr(t.teamName),
    ifaLink: toStr(t.ifaLink),
    active: Boolean(t.active),
    project: Boolean(t.project),
    teamYear: toStr(t.teamYear),

    // ----- LEAGUE CURRENT PERFORMANCE -----
    league: toStr(t.league),
    leagueLevel: toStr(t.leagueLevel),
    leagueRound: toStr(t.leagueRound),
    leaguePosition: toStr(t.leaguePosition),
    points: toStr(t.points),
    leagueGoalsFor: toStr(t.leagueGoalsFor),
    leagueGoalsAgainst: toStr(t.leagueGoalsAgainst),

    // ----- TARGETS META -----
    targetsStatus: toStr(targets.status),
    targetsAssignedAt: toStr(targets.assignedAt),
    targetsAssignedBy: toStr(targets.assignedBy),
    targetsBenchmarkLevelId: toStr(targets.benchmarkLevelId),

    // ----- TARGET VALUES -----
    targetPosition: toStr(targets.targetPosition),
    targetPoints: toStr(targets.targetPoints),
    targetSuccessRate: toStr(targets.targetSuccessRate),
    targetGoalsFor: toStr(targets.targetGoalsFor),
    targetGoalsAgainst: toStr(targets.targetGoalsAgainst),
  }
}

export function buildTeamManagementPatch(prevModel, nextModel) {
  const p = prevModel || {}
  const n = nextModel || {}
  const patch = {}

  if (p.teamName !== n.teamName) patch.teamName = n.teamName
  if (p.ifaLink !== n.ifaLink) patch.ifaLink = n.ifaLink
  if (p.active !== n.active) patch.active = n.active
  if (p.teamYear !== n.teamYear) patch.teamYear = n.teamYear
  if (p.project !== n.project) patch.project = n.project

  if (p.league !== n.league) patch.league = n.league
  if (p.leagueLevel !== n.leagueLevel) patch.leagueLevel = n.leagueLevel
  if (p.leagueRound !== n.leagueRound) patch.leagueRound = n.leagueRound
  if (p.leaguePosition !== n.leaguePosition) patch.leaguePosition = n.leaguePosition
  if (p.points !== n.points) patch.points = n.points
  if (p.leagueGoalsFor !== n.leagueGoalsFor) patch.leagueGoalsFor = n.leagueGoalsFor
  if (p.leagueGoalsAgainst !== n.leagueGoalsAgainst) patch.leagueGoalsAgainst = n.leagueGoalsAgainst

  if (p.targetsStatus !== n.targetsStatus) patch.targetsStatus = n.targetsStatus
  if (p.targetsAssignedAt !== n.targetsAssignedAt) patch.targetsAssignedAt = n.targetsAssignedAt
  if (p.targetsAssignedBy !== n.targetsAssignedBy) patch.targetsAssignedBy = n.targetsAssignedBy
  if (p.targetsBenchmarkLevelId !== n.targetsBenchmarkLevelId) {
    patch.targetsBenchmarkLevelId = n.targetsBenchmarkLevelId
  }

  if (p.targetPosition !== n.targetPosition) patch.targetPosition = n.targetPosition
  if (p.targetPoints !== n.targetPoints) patch.targetPoints = n.targetPoints
  if (p.targetSuccessRate !== n.targetSuccessRate) patch.targetSuccessRate = n.targetSuccessRate
  if (p.targetGoalsFor !== n.targetGoalsFor) patch.targetGoalsFor = n.targetGoalsFor
  if (p.targetGoalsAgainst !== n.targetGoalsAgainst) {
    patch.targetGoalsAgainst = n.targetGoalsAgainst
  }

  return patch
}

export function pickTeamManagementDirtySnapshot(model) {
  const m = model || {}

  return {
    active: Boolean(m.active),
    project: Boolean(m.project),

    teamName: toStr(m.teamName),
    teamYear: toStr(m.teamYear),
    ifaLink: toStr(m.ifaLink),

    league: toStr(m.league),
    leagueLevel: toStr(m.leagueLevel),
    leagueRound: toStr(m.leagueRound),
    leaguePosition: toStr(m.leaguePosition),
    points: toStr(m.points),
    leagueGoalsFor: toStr(m.leagueGoalsFor),
    leagueGoalsAgainst: toStr(m.leagueGoalsAgainst),

    targetsStatus: toStr(m.targetsStatus),
    targetsAssignedAt: toStr(m.targetsAssignedAt),
    targetsAssignedBy: toStr(m.targetsAssignedBy),
    targetsBenchmarkLevelId: toStr(m.targetsBenchmarkLevelId),

    targetPosition: toStr(m.targetPosition),
    targetPoints: toStr(m.targetPoints),
    targetSuccessRate: toStr(m.targetSuccessRate),
    targetGoalsFor: toStr(m.targetGoalsFor),
    targetGoalsAgainst: toStr(m.targetGoalsAgainst),
  }
}

export function isTeamManagementDirty(baseModel, draftModel) {
  const a = pickTeamManagementDirtySnapshot(baseModel)
  const b = pickTeamManagementDirtySnapshot(draftModel)

  return Object.keys(a).some((key) => a[key] !== b[key])
}
