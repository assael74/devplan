/// C:\projects\devplan\src\ui\filters\useFilters.js

import { useMemo, useState } from 'react'
import { filterData, hasActiveFilters } from './filters.logic'

export function useFilters(items = [], initialFilters = {}, rules = {}) {
  const [filters, setFilters] = useState(initialFilters)

  const onChange = (key, val) => setFilters((p) => ({ ...p, [key]: val }))
  const onReset = () => setFilters(initialFilters)

  const filtered = useMemo(() => filterData(items, filters, rules), [items, filters, rules])
  const hasActive = useMemo(() => hasActiveFilters(filters), [filters])

  return { filters, setFilters, filtered, onChange, onReset, hasActive }
}
