// videoHub/components/filters/mobile/VideoMobileFiltersDrawer.js

import React, { useMemo, useCallback } from 'react'
import FiltersDrawer from '../../../../../ui/patterns/filters/FiltersDrawer.js'
import {
  buildVideoMobileDrawerConfig,
} from './videoMobileFilters.utils'

export default function VideoMobileFiltersDrawer({
  open,
  onClose,
  filters,
  onFilters,
  context,
  total = 0,
  shown = 0,
}) {
  const { fields, groups } = useMemo(() => {
    return buildVideoMobileDrawerConfig({ filters, context })
  }, [filters, context])

  const handleChange = useCallback(
    (key, value) => {
      onFilters((prev) => {
        const next = { ...prev, [key]: value }

        if (key === 'parentTagId') {
          next.childTagId = ''
        }

        return next
      })
    },
    [onFilters]
  )

  const handleReset = useCallback(() => {
    onFilters((prev) => ({
      ...prev,
      q: '',
      parentTagId: '',
      childTagId: '',
    }))
  }, [onFilters])

  return (
    <FiltersDrawer
      open={open}
      onClose={onClose}
      title="סינון וידאו"
      filters={filters}
      fields={fields}
      groups={groups}
      onChange={handleChange}
      onReset={handleReset}
      subtitle={`מציג ${shown} מתוך ${total}`}
    />
  )
}
