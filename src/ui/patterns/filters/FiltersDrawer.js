// ui/patterns/filters/FiltersDrawer.js

import React from 'react'
import MobileFiltersDrawerShell from './MobileFiltersDrawerShell'
import FiltersPanel from './FiltersPanel'
import { hasActiveFilters } from './filters.logic'

export default function FiltersDrawer({
  open,
  onClose,
  entity = 'videoGeneral',
  title = 'פילטרים',
  subtitle = '',
  resultsText = '',
  filters = {},
  groups = [],
  fields = [],
  size = 'md',
  panelSize = 'md',
  onChange = () => {},
  onReset = () => {},
}) {
  return (
    <MobileFiltersDrawerShell
      open={open}
      onClose={onClose}
      entity={entity}
      title={title}
      subtitle={subtitle}
      resultsText={resultsText}
      onReset={onReset}
      resetDisabled={!hasActiveFilters(filters)}
      size={size}
    >
      <FiltersPanel
        filters={filters}
        groups={groups}
        fields={fields}
        onChange={onChange}
        size={panelSize}
      />
    </MobileFiltersDrawerShell>
  )
}
