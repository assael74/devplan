// src/features/playersDatabase/catalog/teamIdentity.js

const clean = value => String(value ?? '').trim()

const toPositiveInt = (value, fallback = 1) => {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

export const inferTeamSlotByLeagueLevel = level => (
  Number(level) === 1 ? 1 : 2
)

export const buildTeamSlotId = ({
  clubId,
  ageGroupId,
  teamSlot,
} = {}) => {
  const slot = toPositiveInt(teamSlot)

  return [
    clean(clubId),
    clean(ageGroupId),
    slot,
  ].filter(Boolean).join('_')
}

export const buildTeamSeasonKey = ({
  clubId,
  seasonId,
  ageGroupId,
  teamSlot,
  leagueId,
} = {}) => {
  const slot = toPositiveInt(teamSlot)

  return [
    clean(clubId),
    clean(seasonId),
    clean(ageGroupId),
    slot,
    clean(leagueId),
  ].filter(Boolean).join('__')
}

export const buildTeamIdentity = ({
  clubId,
  clubName,
  seasonId,
  ageGroupId,
  ageGroupLabel,
  teamSlot,
  leagueId,
  leagueName,
  externalTeamId = '',
} = {}) => {
  const slot = toPositiveInt(teamSlot)

  return {
    clubId: clean(clubId),
    clubName: clean(clubName),
    seasonId: clean(seasonId),
    ageGroupId: clean(ageGroupId),
    ageGroupLabel: clean(ageGroupLabel),
    teamSlot: slot,
    teamSlotId: buildTeamSlotId({ clubId, ageGroupId, teamSlot: slot }),
    teamSeasonKey: buildTeamSeasonKey({
      clubId,
      seasonId,
      ageGroupId,
      teamSlot: slot,
      leagueId,
    }),
    leagueId: clean(leagueId),
    leagueName: clean(leagueName),
    externalTeamId: clean(externalTeamId),
  }
}
