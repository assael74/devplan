// playerProfile/modules/abilities/useAbilitiesSummary.js

import { useMemo } from 'react'
import { isFilled } from './abilities.logic.js'

export default function useAbilitiesSummary(domains = []) {
  const total = useMemo(() => {
    return domains.reduce((sum, domain) => sum + (domain?.items?.length || 0), 0)
  }, [domains])

  const filled = useMemo(() => {
    return domains.reduce((sum, domain) => {
      return sum + (domain?.items || []).filter((item) => isFilled(item?.value)).length
    }, 0)
  }, [domains])

  const allScores = useMemo(() => {
    return domains
      .flatMap((domain) => (domain?.items || []).map((item) => item?.value))
      .filter(isFilled)
  }, [domains])

  const avgAll = useMemo(() => {
    if (!allScores.length) return NaN
    return allScores.reduce((sum, value) => sum + value, 0) / allScores.length
  }, [allScores])

  return {
    total,
    filled,
    allScores,
    avgAll,
  }
}
