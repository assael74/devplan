// src/features/tagsHub/components/mobile/TagsListMobile.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi'

const TYPE_COLORS = {
  formation: '#7C3AED',
  pitch_area: '#0891B2',
  game_principle: '#2563EB',
  action_technique: '#16A34A',
  situation: '#F97316',
  position_role: '#0F766E',
  mental: '#D97706',
}

export default function TagsListMobile({ sections }) {
  const s = sections || {}
  const types = Array.isArray(s.types) ? s.types : []

  if (!types.length && !Array.isArray(s.categories)) {
    return (
      <Sheet variant="soft" sx={{ borderRadius: 16, p: 2, textAlign: 'center' }}>
        <Typography level="body-sm">אין תגיות להצגה</Typography>
      </Sheet>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Sheet variant="outlined" sx={{ borderRadius: 16, p: 1.25 }}>
        <Typography level="title-sm" sx={{ mb: 1 }}>
          קטגוריות וידאו
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {(s.categories || []).map(category => (
            <Chip
              key={category.id}
              size="sm"
              variant="soft"
              startDecorator={iconUi({ id: category.iconId || 'tags' })}
            >
              {category.label}
            </Chip>
          ))}
        </Box>
      </Sheet>

      {types.map(type => {
        const color = TYPE_COLORS[type.id] || '#64748B'

        return (
          <Sheet key={type.id} variant="outlined" sx={{ borderRadius: 16, p: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              {iconUi({ id: type.iconId || 'tags', sx: { color } })}
              <Typography level="title-sm">{type.label}</Typography>
              <Chip size="sm" variant="soft">
                {type.tags?.length || 0}
              </Chip>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {(type.tags || []).map(tag => (
                <Chip key={tag.id} size="sm" variant="soft" sx={{ color }}>
                  {tag.tagName}
                </Chip>
              ))}
            </Box>
          </Sheet>
        )
      })}
    </Box>
  )
}
