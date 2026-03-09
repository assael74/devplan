// src/features/videoHub/components/filters/rows/VideoFiltersRow.js
import React from 'react'
import { Box, Input, Select, Option, Chip } from '@mui/joy'
import { videoComponentsSx as sx } from '../../components.sx'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { MONTHS } from '../filters.constants'

export default function VideoFiltersRow({ tab, filters, options, setCascade }) {
  const yearsArr = Array.isArray(options?.years) ? options.years : []
  const tagOptionsArr = Array.isArray(options?.tagOptions) ? options.tagOptions : []
  const sourceOptionsArr = Array.isArray(options?.sourceOptions) ? options.sourceOptions : []

  const tagsValue = Array.isArray(filters.tags) ? filters.tags : filters.tags ? [filters.tags] : []

  const placeholder =
    tab !== 'general'
      ? 'חיפוש (שם / שחקן / קבוצה / מועדון / תאריך)…'
      : 'חיפוש (שם / הערות / קישור)…'

  return (
    <Box sx={sx.filtersWrap}>
      <Input
        size="sm"
        placeholder={placeholder}
        value={filters.q}
        onChange={(e) => setCascade({ q: e.target.value })}
        sx={sx.filtersInput}
        startDecorator={iconUi({ id: 'search' })}
      />

      {/* ✅ GENERAL: Source filter only (no year/month) */}
      {tab === 'general' ? (
        <Select
          size="sm"
          value={filters.source || ''}
          onChange={(e, v) => setCascade({ source: v || '' })}
          sx={sx.filtersSelect}
          placeholder="סורס"
          startDecorator={iconUi({ id: 'link' })}
        >
          <Option value="">כל המקורות</Option>
          {(sourceOptionsArr || []).map((s) => (
            <Option key={s.id} value={s.id}>
              {s.label}
            </Option>
          ))}
        </Select>
      ) : (
        <>
          <Select
            size="sm"
            value={filters.year}
            onChange={(e, v) => setCascade({ year: v || '' })}
            sx={sx.filtersSelect}
            placeholder="שנה"
          >
            <Option value="">כל השנים</Option>
            {yearsArr.map((y) => (
              <Option key={y} value={y}>
                {y}
              </Option>
            ))}
          </Select>

          <Select
            size="sm"
            value={filters.month}
            onChange={(e, v) => setCascade({ month: v || '' })}
            sx={sx.filtersSelect}
            placeholder="חודש"
          >
            {MONTHS.map((m) => (
              <Option key={m.v || 'all'} value={m.v}>
                {m.l}
              </Option>
            ))}
          </Select>
        </>
      )}

      <Select
        multiple
        size="sm"
        value={tagsValue}
        onChange={(e, v) => setCascade({ tags: Array.isArray(v) ? v : v ? [v] : [] })}
        sx={sx.filtersSelect}
        placeholder="תגים"
        startDecorator={iconUi({ id: 'tag' })}
      >
        {tagOptionsArr.map((t) => (
          <Option key={t.id} value={t.id}>
            {t.label}
          </Option>
        ))}
      </Select>

      {tab !== 'general' && (
        <Chip
          size="sm"
          variant={filters.onlyUnlinked ? 'solid' : 'soft'}
          onClick={() => setCascade({ onlyUnlinked: !filters.onlyUnlinked })}
          sx={{ cursor: 'pointer' }}
          startDecorator={iconUi({ id: 'noLink' })}
        >
          לא משויך
        </Chip>
      )}
    </Box>
  )
}
