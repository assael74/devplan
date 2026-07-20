// src/features/playersDatabase/catalog/teamIdentity.js

const clean = value => String(value ?? '').trim()

const toPositiveInt = (value, fallback = 1) => {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

const normalizeBirthYear = value => {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : 0
}

export const inferTeamSlotByLeagueLevel = level => (
  Number(level) === 1 ? 1 : 2
)

export const buildBirthTeamId = ({
  clubId,
  birthYear,
  birthTeamSlot,
  teamSlot,
} = {}) => {
  const slot = toPositiveInt(birthTeamSlot || teamSlot)

  return [
    clean(clubId),
    normalizeBirthYear(birthYear),
    slot,
  ].filter(Boolean).join('_')
}

export const buildBirthTeamSeasonKey = ({
  clubId,
  birthYear,
  birthTeamSlot,
  teamSlot,
  seasonId,
  leagueId,
} = {}) => {
  const slot = toPositiveInt(birthTeamSlot || teamSlot)

  return [
    clean(clubId),
    normalizeBirthYear(birthYear),
    slot,
    clean(seasonId),
    clean(leagueId),
  ].filter(Boolean).join('__')
}

export const buildTeamSlotId = payload => buildBirthTeamId(payload)

export const buildTeamSeasonKey = payload => buildBirthTeamSeasonKey(payload)

export const buildBirthTeamIdentity = ({
  clubId,
  clubName,
  seasonId,
  birthYear,
  birthTeamSlot,
  teamSlot,
  ageGroupId,
  ageGroupLabel,
  leagueId,
  leagueName,
  externalTeamId = '',
} = {}) => {
  const slot = toPositiveInt(birthTeamSlot || teamSlot)
  const normalizedBirthYear = normalizeBirthYear(birthYear)
  const birthTeamId = buildBirthTeamId({
    clubId,
    birthYear: normalizedBirthYear,
    birthTeamSlot: slot,
  })
  const birthTeamSeasonKey = buildBirthTeamSeasonKey({
    clubId,
    birthYear: normalizedBirthYear,
    birthTeamSlot: slot,
    seasonId,
    leagueId,
  })

  return {
    clubId: clean(clubId),
    clubName: clean(clubName),
    seasonId: clean(seasonId),
    birthYear: normalizedBirthYear,
    birthTeamSlot: slot,
    birthTeamId,
    birthTeamSeasonKey,
    ageGroupId: clean(ageGroupId),
    ageGroupLabel: clean(ageGroupLabel),
    leagueId: clean(leagueId),
    leagueName: clean(leagueName),
    externalTeamId: clean(externalTeamId),

    teamSlot: slot,
    teamSlotId: birthTeamId,
    teamId: birthTeamId,
    teamSeasonKey: birthTeamSeasonKey,
  }
}

export const buildTeamIdentity = payload => buildBirthTeamIdentity(payload)
