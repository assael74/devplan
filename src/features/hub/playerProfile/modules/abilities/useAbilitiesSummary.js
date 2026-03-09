import { useMemo } from 'react'
import { isFilled } from './abilities.logic'

export default function useAbilitiesSummary(domains = []) {
  const total = useMemo(
    () => domains.reduce((s, d) => s + (d?.items?.length || 0), 0),
    [domains]
  )

  const filled = useMemo(
    () =>
      domains.reduce(
        (s, d) => s + (d?.items || []).filter((i) => isFilled(i.value)).length,
        0
      ),
    [domains]
  )

  const allScores = useMemo(
    () =>
      domains
        .flatMap((d) => (d?.items || []).map((i) => i.value))
        .filter(isFilled),
    [domains]
  )

  const avgAll = useMemo(
    () => (allScores.length ? allScores.reduce((s, x) => s + x, 0) / allScores.length : NaN),
    [allScores]
  )

  return { total, filled, allScores, avgAll }
}
