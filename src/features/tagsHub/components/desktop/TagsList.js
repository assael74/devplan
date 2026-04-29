// src/features/tagsHub/components/TagsList.js
import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { iconUi } from '../../../../ui/core/icons/iconUi'
import { tagSx as sx } from '../../tags.sx'
import { getEntityColors } from '../../../../ui/core/theme/Colors'

const TYPE_UI = {
  general: { title: 'וידאו', icon: 'videoGeneral' },
  analysis: { title: 'ניתוח וידאו', icon: 'videoAnalysis' },
  other: { title: 'אחר', icon: 'tags' },
}

function Section({ typeKey, data, onEdit }) {

  const ui = TYPE_UI[typeKey] || TYPE_UI.other
  const typeColor = getEntityColors(ui.icon).bg

  const groups = Array.isArray(data?.groups) ? data.groups : []
  const orphans = Array.isArray(data?.orphans) ? data.orphans : []
  const childrenByGroupId = data?.childrenByGroupId instanceof Map ? data.childrenByGroupId : new Map()
  const usageByGroupId = data?.usageByGroupId instanceof Map ? data.usageByGroupId : new Map()
  const childrenCountByGroupId = data?.childrenCountByGroupId instanceof Map ? data.childrenCountByGroupId : new Map()

  const hasAnything =
    groups.length > 0 ||
    orphans.length > 0 ||
    (childrenByGroupId && [...childrenByGroupId.keys()].length > 0)

  if (!hasAnything) return null

  return (
    <Box sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionTitleRow}>
          {iconUi({ id: ui.icon, sx: { color: typeColor } })}
          <Typography level="title-sm" noWrap>
            {ui.title}
          </Typography>
        </Box>
      </Box>

      {/* groups + children */}
      {groups.map((g) => {
        const gid = g.id
        const children = childrenByGroupId.get(gid) || []
        const cnt = childrenCountByGroupId.get(gid) || 0
        const usage = usageByGroupId.get(gid) || 0
        const inactive = g?.isActive === false

        return (
          <Box key={gid} sx={{ mb: 1 }}>
            <Box sx={sx.groupRow(inactive)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                <Box onClick={() => onEdit(g)}>
                  <Chip
                    variant="soft"
                    startDecorator={iconUi({ id: 'parents' })}
                    sx={sx.groupChip(typeColor)}
                  >
                    <Typography level="body-sm" noWrap sx={{ minWidth: 0 }}>
                      {g.tagName || 'קטגוריה'}
                    </Typography>
                  </Chip>
                </Box>


                <Typography level="body-xs" sx={{ color: 'neutral.600' }} noWrap>
                  {cnt} תגים • {usage}
                </Typography>
              </Box>
            </Box>

            {children.length > 0 && (
              <Box sx={sx.childrenWrap}>
                {children.map((t) => {
                  const inactiveChild = t?.isActive === false
                  return (
                    <Box key={t.id} sx={{ display: 'inline-flex' }} onClick={() => onEdit(t)}>
                      <Chip
                        variant="soft"
                        startDecorator={iconUi({ id: 'children', sx: { fontSize: 12, color: '#000000' } })}
                        sx={sx.childChip(typeColor, inactiveChild)}
                      >
                        <Typography level="body-xs" noWrap sx={{ minWidth: 0, fontSize: 11, lineHeight: '16px' }}>
                          {t.tagName || 'תג'} • {t.useCount || 0}
                        </Typography>
                      </Chip>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        )
      })}

      {/* orphans */}
      {orphans.length > 0 && (
        <Box>
          <Typography level="body-xs" sx={{ color: 'neutral.600', mb: 0.75 }}>
            ללא קטגוריה
          </Typography>
          <Box sx={sx.childrenWrap}>
            {orphans.map((t) => {
              const inactiveChild = t?.isActive === false
              return (
                <Box key={t.id} sx={{ display: 'inline-flex' }} onClick={() => onEdit(t)}>
                  <Chip
                    variant="soft"
                    startDecorator={iconUi({ id: ui.icon, sx: { fontSize: 12, color: '#000000' } })}
                    sx={sx.tagChip(typeColor, inactiveChild)}
                  >
                    <Typography level="body-xs" noWrap sx={{ minWidth: 0, fontSize: 11, lineHeight: '16px' }}>
                      {t.tagName || 'תג'} • {t.useCount || 0}
                    </Typography>
                  </Chip>
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default function TagsList({ sections, onEdit }) {
  const s = sections || {}
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Section typeKey="general" data={s.general} onEdit={onEdit} />

      <Section typeKey="analysis" data={s.analysis} onEdit={onEdit} />

      <Section typeKey="other" data={s.other} onEdit={onEdit} />
      {!s.general && !s.analysis && !s.other && (
        <Box sx={sx.empty}>
          <Typography level="body-sm">אין תגים להצגה</Typography>
        </Box>
      )}
    </Box>
  )
}
