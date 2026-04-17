// ui/patterns/filters/FiltersDrawer.js

import React from 'react'
import MobileFiltersDrawerShell from './MobileFiltersDrawerShell'
import FiltersPanel from './FiltersPanel'
import { hasActiveFilters } from './filters.logic'

export default function FiltersDrawer({
  open,
  onClose,
  title = 'פילטרים',
  subtitle = '',
  resultsText = '',
  filters = {},
  groups = [],
  fields = [],
  size = 'md',
  onChange = () => {},
  onReset = () => {},
}) {
  return (
    <MobileFiltersDrawerShell
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      resultsText={resultsText}
      onReset={onReset}
      resetDisabled={!hasActiveFilters(filters)}
    >
      <FiltersPanel
        filters={filters}
        groups={groups}
        fields={fields}
        onChange={onChange}
      />
    </MobileFiltersDrawerShell>
  )
}
