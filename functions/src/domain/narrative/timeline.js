// C:\projects\devplan\functions\src\domain\narrative\timeline.js

function clean(value) {
  return String(value || '').trim()
}

function buildTimeline(context = {}, decision = {}) {
  const seasonsMap = new Map()

  context.entries.forEach(entry => {
    const seasonKey = clean(entry.seasonKey || entry.seasonId)
    if (!seasonKey) return

    if (!seasonsMap.has(seasonKey)) {
      seasonsMap.set(seasonKey, {
        seasonKey,
        entries: [],
      })
    }

    seasonsMap.get(seasonKey).entries.push(entry)
  })

  const focusSeasonKey = clean(decision.seasonKey)
  const seasons = [...seasonsMap.values()].map(season => ({
    ...season,
    temporalRole: season.seasonKey === focusSeasonKey ? 'focus' : 'history',
    isFocusSeason: Boolean(focusSeasonKey && season.seasonKey === focusSeasonKey),
    seasonStatus: clean(season.entries?.[0]?.seasonStatus),
  }))
  const transitions = (Array.isArray(context.events) ? context.events : [])
    .filter(event => clean(event.type))
    .map(event => ({
      type: clean(event.type),
      seasonKey: clean(event.seasonKey),
      fromClubId: clean(event.fromClubId),
      fromClubName: clean(event.fromClubName),
      toClubId: clean(event.toClubId),
      toClubName: clean(event.toClubName),
      moveType: clean(event.moveType),
      direction: clean(event.direction),
      fromClubStrengthLevel: event.fromClubStrengthLevel,
      toClubStrengthLevel: event.toClubStrengthLevel,
      fromLeagueLevel: event.fromLeagueLevel,
      toLeagueLevel: event.toLeagueLevel,
    }))

  return {
    focusSeasonKey,
    historySeasonKeys: seasons
      .filter(season => !season.isFocusSeason)
      .map(season => season.seasonKey),
    seasons,
    transitions,
  }
}

module.exports = { buildTimeline }
