const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const ROSTER_STATUS = Object.freeze({
  REGULAR: 'regular',
  LEFT: 'left',
  YOUNGER_AGE_GROUP: 'youngerAgeGroup',
})

const VALID_ROSTER_STATUSES = new Set(Object.values(ROSTER_STATUS))

// teamPlayers holds every participant in the season. rosterStatus is only the
// membership/scope state; canonical transfer facts live in transfersIn/out.
export const normalizeRosterStatus = value => {
  const status = clean(value)
  return VALID_ROSTER_STATUSES.has(status)
    ? status
    : ROSTER_STATUS.REGULAR
}

export const isCurrentRosterPlayer = player => (
  normalizeRosterStatus(player?.rosterStatus) === ROSTER_STATUS.REGULAR
)

export const countCurrentRosterPlayers = players => (
  (Array.isArray(players) ? players : []).filter(isCurrentRosterPlayer).length
)
