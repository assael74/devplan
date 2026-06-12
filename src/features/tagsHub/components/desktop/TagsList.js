// src/features/tagsHub/components/desktop/TagsList.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi'
import { tagSx as sx } from '../../tags.sx'

const TYPE_COLORS = {
  formation: '#7C3AED',
  pitch_area: '#0891B2',
  game_principle: '#2563EB',
  action_technique: '#16A34A',
  situation: '#F97316',
  position_role: '#0F766E',
  mental: '#D97706',
}

const toneColors = {
  green: '#16A34A',
  orange: '#F97316',
  blue: '#2563EB',
  purple: '#7C3AED',
  yellow: '#D97706',
  cyan: '#0891B2',
  teal: '#0F766E',
  neutral: '#64748B',
}

function StatChip({ label, value, color = 'neutral' }) {
  return (
    <Chip size="md" variant="soft" color={color} sx={sx.statChip}>
      {label}: {value}
    </Chip>
  )
}

function CategoryChip({ category }) {
  const color = toneColors[category?.tone] || toneColors.neutral

  return (
    <Chip
      size="md"
      variant="soft"
      startDecorator={iconUi({ id: category.iconId || 'tags', sx: { color } })}
      sx={sx.videoCategoryChip(color)}
    >
      {category.label}
    </Chip>
  )
}

function SeedTagChip({ tag, type }) {
  const color = TYPE_COLORS[type?.id] || '#64748B'
  const hasSlug = Boolean(tag?.slug)
  const hasOrder = Number.isFinite(Number(tag?.order))
  const issue = !hasSlug || !hasOrder

  return (
    <Chip
      size="md"
      variant={issue ? 'outlined' : 'soft'}
      color={issue ? 'warning' : 'neutral'}
      startDecorator={iconUi({ id: type?.iconId || 'tags', sx: { color } })}
      sx={sx.seedTagChip(color, issue)}
    >
      {tag.tagName}
    </Chip>
  )
}

function TypeSection({ type }) {
  const color = TYPE_COLORS[type?.id] || '#64748B'
  const tags = Array.isArray(type?.tags) ? type.tags : []
  const issueCount = tags.filter(tag => !tag.slug || !Number.isFinite(Number(tag.order))).length

  return (
    <Box sx={sx.videoTypeSection(color)}>
      <Box sx={sx.videoTypeHeader}>
        <Box sx={sx.videoTypeTitle}>
          {iconUi({ id: type.iconId || 'tags', sx: { color } })}
          <Typography level="title-sm" noWrap>
            {type.label}
          </Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }} noWrap>
            {type.id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <StatChip label="תגים" value={tags.length} />
          {issueCount ? <StatChip label="בעיות" value={issueCount} color="warning" /> : null}
        </Box>
      </Box>

      {tags.length ? (
        <Box sx={sx.videoTagsWrap}>
          {tags.map(tag => (
            <SeedTagChip key={tag.id} tag={tag} type={type} />
          ))}
        </Box>
      ) : (
        <Box sx={sx.emptyInline}>
          <Typography level="body-xs">אין תגיות תחת סוג זה</Typography>
        </Box>
      )}
    </Box>
  )
}

export default function TagsList({ sections }) {
  const s = sections || {}
  const stats = s.stats || {}
  const categories = Array.isArray(s.categories) ? s.categories : []
  const types = Array.isArray(s.types) ? s.types : []
  const invalidTags = Array.isArray(s.invalidTags) ? s.invalidTags : []

  const hasAnything = categories.length || types.length || invalidTags.length

  if (!hasAnything) {
    return (
      <Box sx={sx.empty}>
        <Typography level="body-sm">אין תגיות להצגה</Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.videoTagsPage}>
      <Box sx={sx.statsRow}>
        <StatChip label="קטגוריות" value={stats.categories ?? categories.length} />
        <StatChip label="סוגים" value={stats.types ?? types.length} />
        <StatChip label="תגיות" value={stats.tags ?? types.reduce((acc, type) => acc + type.tags.length, 0)} />
        {stats.invalidTags ? <StatChip label="לא תקין" value={stats.invalidTags} color="danger" /> : null}
      </Box>

      <Box sx={sx.section}>
        <Box sx={sx.sectionHeader}>
          <Box sx={sx.sectionTitleRow}>
            {iconUi({ id: 'videoGeneral' })}
            <Typography level="title-sm">קטגוריות וידאו ראשיות</Typography>
          </Box>
        </Box>

        <Box sx={sx.videoTagsWrap}>
          {categories.map(category => (
            <CategoryChip key={category.id} category={category} />
          ))}
        </Box>
      </Box>

      {types.map(type => (
        <TypeSection key={type.id} type={type} />
      ))}

      {invalidTags.length ? (
        <Box sx={sx.issueSection}>
          <Typography level="title-sm" color="danger">
            תגיות עם tagType לא תקין
          </Typography>
          <Box sx={sx.videoTagsWrap}>
            {invalidTags.map(tag => (
              <Chip key={tag.id} size="sm" variant="soft" color="danger">
                {tag.tagName} · {tag.tagType || 'חסר סוג'}
              </Chip>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}
