// src/features/playersDatabase/ui/pages/teamPage/information/model/teamSeasonTabs.model.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const buildTeamSeasonTabs = ({
  seasonOptions = [],
  seasonSnapshots = [],
  selectedOptionKey = '',
  selectedSeasonKey = '',
} = {}) => {
  const options = Array.isArray(seasonOptions) ? seasonOptions : []
  const snapshots = Array.isArray(seasonSnapshots) ? seasonSnapshots : []
  const sources = options.length ? options : snapshots
  const seen = new Set()

  return sources.flatMap(season => {
    const seasonKey = clean(season?.seasonKey || season?.seasonId)
    const optionKey = clean(season?.optionKey || seasonKey)
    if (!optionKey || seen.has(optionKey)) return []
    seen.add(optionKey)

    const ageGroupLabel = clean(season?.ageGroupLabel || season?.ageGroupId)
    const selected = selectedOptionKey
      ? optionKey === clean(selectedOptionKey)
      : seasonKey === clean(selectedSeasonKey)

    return [{
      optionKey,
      key: optionKey,
      label: [ageGroupLabel, seasonKey].filter(Boolean).join(' · '),
      birthYear: season?.birthYear || '',
      ageGroupLabel,
      selected,
    }]
  })
}
