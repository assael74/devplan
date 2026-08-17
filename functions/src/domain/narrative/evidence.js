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

function addScoutSideEvidence(evidence, prefix, side, snapshot) {
  if (!snapshot) return

  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.targetRate`,
    type: 'number',
    value: snapshot.target?.rate,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.targetLevel`,
    type: 'label',
    value: clean(snapshot.target?.level),
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.rankingRate`,
    type: 'number',
    value: snapshot.ranking?.rate,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.rankingLevel`,
    type: 'label',
    value: clean(snapshot.ranking?.level),
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.anomalyRate`,
    type: 'number',
    value: snapshot.anomaly?.rate,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.anomalyLevel`,
    type: 'label',
    value: clean(snapshot.anomaly?.level),
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.qualityRate`,
    type: 'number',
    value: snapshot.quality?.rate,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.priorityLevel`,
    type: 'label',
    value: clean(snapshot.priority?.level),
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.scoutPriorityScore`,
    type: 'number',
    value: snapshot.priority?.score,
  })
  addEvidence(evidence, {
    id: `${prefix}.teamScout.${side}.opportunityType`,
    type: 'label',
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

function buildEvidence(context = {}, decision = {}) {
  const evidence = []

  context.entries.forEach((entry, index) => {
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

    entry.profiles.forEach(profile => {
      const profileId = clean(profile.profileId)
      if (!profileId) return

      addEvidence(evidence, {
        id: `${prefix}.profile.${profileId}`,
        type: 'profile',
        value: profile.profileLabel || profileId,
      })
    })
  })

  addEvidence(evidence, {
    id: 'decision.actionStatus',
    type: 'label',
    value: clean(decision.actionStatus),
  })
  addEvidence(evidence, {
    id: 'decision.futureOutlook',
    type: 'label',
    value: clean(decision.futureOutlook),
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
    id: 'decision.expectedLevelDelta',
    type: 'number',
    value: decision.expectedLevelDelta,
  })

  return evidence
}

module.exports = { buildEvidence }
