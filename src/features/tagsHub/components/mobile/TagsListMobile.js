// src/features/tagsHub/components/mobile/TagsListMobile.js

import React from 'react'
import { Box, Typography, Chip, Sheet } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi'
import { getEntityColors } from '../../../../ui/core/theme/Colors'

import { hubSx as sx } from './sx/hub.sx'

const TYPE_UI = {
  general: { title: 'וידאו כללי', icon: 'videoGeneral' },
  analysis: { title: 'ניתוח וידאו', icon: 'videoAnalysis' },
  other: { title: 'אחר', icon: 'tags' },
}

function SectionMobile({ typeKey, data, onEdit }) {
  const ui = TYPE_UI[typeKey] || TYPE_UI.other
  const typeColor = getEntityColors(ui.icon).bg

  const groups = Array.isArray(data?.groups) ? data.groups : []
  const orphans = Array.isArray(data?.orphans) ? data.orphans : []
  const childrenByGroupId =
    data?.childrenByGroupId instanceof Map ? data.childrenByGroupId : new Map()
  const usageByGroupId =
    data?.usageByGroupId instanceof Map ? data.usageByGroupId : new Map()
  const childrenCountByGroupId =
    data?.childrenCountByGroupId instanceof Map
      ? data.childrenCountByGroupId
      : new Map()

  const hasAnything =
    groups.length > 0 ||
    orphans.length > 0 ||
    [...childrenByGroupId.keys()].length > 0

  if (!hasAnything) return null

  return (
    <Sheet variant="outlined" sx={sx.sheetRoot}>
      <Box sx={sx.boxTitle}>
        <Typography
          level="title-sm"
          noWrap
          startDecorator={iconUi({ id: ui.icon, sx: { color: typeColor } })}
        >
          {ui.title}
        </Typography>

        <Chip size="sm" variant="soft">
          {groups.length + orphans.length}
        </Chip>
      </Box>

      {groups.map((g) => {
        const gid = g.id
        const children = childrenByGroupId.get(gid) || []
        const cnt = childrenCountByGroupId.get(gid) || 0
        const usage = usageByGroupId.get(gid) || 0
        const inactive = g?.isActive === false

        return (
          <Sheet
            key={gid}
            variant="soft"
            onClick={() => onEdit(g)}
            sx={sx.sheetClick(inactive)}
          >
            <Box sx={sx.boxTitle}>
              <Typography
                level="body-sm"
                noWrap
                startDecorator={iconUi({ id: 'parents', sx: { color: typeColor } })}
                sx={{ fontWeight: 700 }}
              >
                {g.tagName || 'קטגוריה'}
              </Typography>

              <Typography level="body-xs" sx={{ color: 'neutral.500', flexShrink: 0 }}>
                {cnt} תגים • {usage}
              </Typography>
            </Box>

            {children.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {children.map((t) => {
                  const inactiveChild = t?.isActive === false

                  return (
                    <Chip
                      key={t.id}
                      size="sm"
                      variant="soft"
                      startDecorator={iconUi({id: 'children', sx: { fontSize: 12, color: '#000' } })}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(t)
                      }}
                      sx={sx.chip(inactiveChild, typeColor)}
                    >
                      <Typography level="body-xs" noWrap>
                        {t.tagName || 'תג'} • {t.useCount || 0}
                      </Typography>
                    </Chip>
                  )
                })}
              </Box>
            ) : null}
          </Sheet>
        )
      })}

      {orphans.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
            ללא קטגוריה
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {orphans.map((t) => {
              const inactiveChild = t?.isActive === false

              return (
                <Chip
                  key={t.id}
                  size="sm"
                  variant="soft"
                  startDecorator={iconUi({id: ui.icon, sx: { fontSize: 12, color: '#000' } })}
                  onClick={() => onEdit(t)}
                  sx={{ maxWidth: '100%', opacity: inactiveChild ? 0.65 : 1, cursor: 'pointer' }}
                >
                  <Typography level="body-xs" noWrap>
                    {t.tagName || 'תג'} • {t.useCount || 0}
                  </Typography>
                </Chip>
              )
            })}
          </Box>
        </Box>
      ) : null}
    </Sheet>
  )
}

export default function TagsListMobile({ sections, onEdit }) {
  const s = sections || {}

  const hasData = Boolean(s.general || s.analysis || s.other)

  if (!hasData) {
    return (
      <Sheet variant="soft" sx={{ borderRadius: 16, p: 2, textAlign: 'center' }}>
        <Typography level="body-sm">אין תגים להצגה</Typography>
      </Sheet>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <SectionMobile
        typeKey="general"
        data={s.general}
        onEdit={onEdit}
      />
      
      <SectionMobile
        typeKey="analysis"
        data={s.analysis}
        onEdit={onEdit}
      />

      <SectionMobile
        typeKey="other"
        data={s.other}
        onEdit={onEdit}
       />
    </Box>
  )
}
