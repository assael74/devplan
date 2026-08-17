// C:\projects\devplan\functions\src\domain\narrative\meaning.js

function clean(value) {
  return String(value || '').trim()
}

function buildTeamScoutMeaning(performance = null) {
  if (!performance || typeof performance !== 'object') return null

  return {
    targetLevel: clean(performance.targetLevel),
    rankingLevel: clean(performance.rankingLevel),
    anomalyLevel: clean(performance.anomalyLevel),
    priorityLevel: clean(performance.priorityLevel),
    opportunityType: clean(performance.opportunityType),
  }
}

function buildEntryMeaning(entry = {}) {
  const profiles = Array.isArray(entry.profiles) ? entry.profiles : []

  return {
    seasonKey: clean(entry.seasonKey || entry.seasonId),
    birthTeamDocumentId: clean(entry.birthTeamDocumentId),
    birthTeamSlot: entry.birthTeamSlot,
    ageGroupId: clean(entry.ageGroupId),
    isPlayingUp: entry.isPlayingUp,
    leagueLevel: entry.leagueLevel,
    clubStrengthLevel: entry.clubStrengthLevel,
    profileIds: profiles.map(profile => clean(profile.profileId)).filter(Boolean).sort(),
    priority: clean(entry.priority?.actionStatus),
    trajectory: clean(entry.trajectory?.direction),
    reliabilityLevels: profiles
      .map(profile => clean(profile.reliability?.level))
      .filter(Boolean)
      .sort(),
    teamScout: {
      attack: buildTeamScoutMeaning(entry.stats?.teamAttackPerformance),
      defense: buildTeamScoutMeaning(entry.stats?.teamDefensePerformance),
    },
  }
}

function buildMeaning({ context = {}, timeline = {}, decision = {} } = {}) {
  return {
    version: 1,
    entries: context.entries.map(buildEntryMeaning),
    transitions: (timeline.transitions || []).map(item => ({
      type: clean(item.type),
      seasonKey: clean(item.seasonKey),
      direction: clean(item.direction),
      moveType: clean(item.moveType),
      fromClubStrengthLevel: item.fromClubStrengthLevel,
      toClubStrengthLevel: item.toClubStrengthLevel,
      fromLeagueLevel: item.fromLeagueLevel,
      toLeagueLevel: item.toLeagueLevel,
    })),
    decision: {
      actionStatus: clean(decision.actionStatus),
      futureOutlook: clean(decision.futureOutlook),
      currentCompetitionLevel: decision.currentCompetitionLevel,
      nextCompetitionLevel: decision.nextCompetitionLevel,
    },
  }
}

module.exports = { buildMeaning }
