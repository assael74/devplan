// C:\projects\devplan\functions\src\domain\narrative\meta.js

function clean(value) {
  return String(value || '').trim()
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function resolveSeasonStartYear(value) {
  const match = clean(value).match(/^(\d{2,4})\/(\d{2,4})$/)
  if (!match) return 0

  const year = Number(match[1])
  if (!Number.isFinite(year)) return 0

  return year < 100 ? 2000 + year : year
}

function resolveLatestEntry(entries = []) {
  return [...entries]
    .filter(entry => clean(entry.seasonKey || entry.seasonId))
    .sort((left, right) => (
      resolveSeasonStartYear(right.seasonKey || right.seasonId) -
      resolveSeasonStartYear(left.seasonKey || left.seasonId)
    ))[0] || null
}

function resolveCertainty(entries = []) {
  const latestEntry = resolveLatestEntry(entries)
  const profiles = Array.isArray(latestEntry?.profiles) ? latestEntry.profiles : []
  const profile = [...profiles]
    .filter(item => item && item.reliability)
    .sort((left, right) => Number(right.score || 0) - Number(left.score || 0))[0] || null

  return {
    score: numberOrNull(profile?.reliability?.score),
    level: clean(profile?.reliability?.level),
  }
}

function buildSeasonKeys(entries = []) {
  return [...new Set(
    entries
      .map(entry => clean(entry.seasonKey || entry.seasonId))
      .filter(Boolean)
  )]
}

function buildProfileRefs(entries = []) {
  const refs = []
  const seen = new Set()

  entries.forEach(entry => {
    const profiles = Array.isArray(entry.profiles) ? entry.profiles : []

    profiles.forEach(profile => {
      const ref = {
        seasonKey: clean(entry.seasonKey || entry.seasonId),
        birthTeamId: clean(entry.birthTeamId),
        birthTeamDocumentId: clean(entry.birthTeamDocumentId),
        birthTeamSlot: Number(entry.birthTeamSlot || 0),
        profileId: clean(profile.profileId),
      }
      const key = [
        ref.seasonKey,
        ref.birthTeamDocumentId || ref.birthTeamId,
        ref.birthTeamSlot,
        ref.profileId,
      ].join('|')

      if (!ref.profileId || seen.has(key)) return

      seen.add(key)
      refs.push(ref)
    })
  })

  return refs
}

function addPresentationEntity(entities, seen, type, value) {
  const label = clean(value)
  if (!label) return

  const key = `${type}|${label.toLocaleLowerCase('he')}`
  if (seen.has(key)) return

  seen.add(key)
  entities.push({ type, label })
}

function buildPresentation(entries = [], player = {}, decision = {}) {
  const entities = []
  const seen = new Set()
  const certainty = resolveCertainty(entries)

  addPresentationEntity(entities, seen, 'player', player.fullName)
  addPresentationEntity(entities, seen, 'birthYear', player.birthYear)

  entries.forEach(entry => {
    addPresentationEntity(entities, seen, 'club', entry.clubName)
    addPresentationEntity(entities, seen, 'team', entry.teamName)
    addPresentationEntity(entities, seen, 'league', entry.leagueName)
    addPresentationEntity(entities, seen, 'ageGroup', entry.ageGroupLabel)
    addPresentationEntity(entities, seen, 'ageGroup', entry.ageGroupId)
    addPresentationEntity(entities, seen, 'birthYear', entry.groupBirthYear)

    const profiles = Array.isArray(entry.profiles) ? entry.profiles : []
    profiles.forEach(profile => {
      addPresentationEntity(entities, seen, 'profile', profile.profileLabel)
    })
  })

  return {
    entities,
    decision: {
      actionStatus: clean(decision.actionStatus),
      exposureLevel: clean(decision.exposureLevel),
      futureOutlook: clean(decision.futureOutlook),
      currentCompetitionLevel: decision.currentCompetitionLevel,
      nextCompetitionLevel: decision.nextCompetitionLevel,
      certaintyScore: certainty.score,
      certaintyLevel: certainty.level,
    },
  }
}

function buildMeta(input = {}) {
  const entries = Array.isArray(input.context?.entries)
    ? input.context.entries
    : []

  return {
    inputHash: clean(input.inputHash),
    seasonKeys: buildSeasonKeys(entries),
    profileRefs: buildProfileRefs(entries),
    presentation: buildPresentation(entries, input.player || {}, input.decision || {}),
  }
}

module.exports = { buildMeta }
