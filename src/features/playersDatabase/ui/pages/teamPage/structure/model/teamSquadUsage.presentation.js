const clean = value => String(value === undefined || value === null ? '' : value).trim()

const SQUAD_USAGE_LABEL_BY_BENCHMARK = Object.freeze({
  below_typical: 'בסיס סגל צר',
  typical: 'בסיס סגל מאוזן',
  above_typical: 'בסיס סגל רחב',
})

export const getTeamSquadUsageLabel = benchmarkState => (
  SQUAD_USAGE_LABEL_BY_BENCHMARK[clean(benchmarkState)] ||
  SQUAD_USAGE_LABEL_BY_BENCHMARK.typical
)
