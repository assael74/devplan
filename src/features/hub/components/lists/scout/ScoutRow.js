import React from 'react'
import { Sheet, Box, Typography, Chip, Avatar, IconButton } from '@mui/joy'
import MoreVertRounded from '@mui/icons-material/MoreVertRounded'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export default function ScoutRow({
  row,
  selected,
  onSelect,
  actions,
}) {
  const title = row?.title
  const sub = row?.subline
  const photo = row?.photo
  const idIcon = row?.idIcon

  return (
    <Sheet
      className="scoutRow"
      variant="plain"
      onClick={() => onSelect(row)}
      sx={{
        width: '100%',
        p: 1,
        borderRadius: 'sm',
        border: '1px solid',
        borderColor: 'transparent',
        bgcolor: 'neutral.softBg',
        boxShadow: 'none',
        ...(selected && {
          borderColor: 'primary.300',
          boxShadow: 'sm',
          bgcolor: 'primary.softBg',
        }),

        '&:hover': {
          borderColor: 'divider',
          boxShadow: 'xs',
          bgcolor: 'neutral.softHoverBg',
        },

        // stripe עדין ב-selected
        '&::before': selected
          ? {
              content: '""',
              position: 'absolute',
              insetInlineStart: 0,
              top: 10,
              bottom: 10,
              width: 4,
              borderRadius: 99,
              bgcolor: 'primary.500',
            }
          : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Avatar */}
        <Avatar src={photo} sx={{ '--Avatar-size': '38px', flexShrink: 0 }} />

        {/* Main */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            {/* Status dot */}
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: 99,
                bgcolor: row?.active === false ? 'neutral.400' : 'success.500',
                flexShrink: 0,
              }}
            />
            <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
              {title}
            </Typography>

          </Box>

          {!!sub && (
            <Typography level="body-xs" sx={{ opacity: 0.55 }}>
              {sub}
            </Typography>
          )}
        </Box>

        {/* Actions: מופיע רק בהובר/selected */}
        <Box
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          sx={{
            display: 'grid',
            placeItems: 'center',
            opacity: selected ? 1 : 0,
            transition: '0.15s ease',
            '.staffRow:hover &': { opacity: 1 },
          }}
        >
          {actions || (
            <IconButton size="sm" variant="soft">
              <MoreVertRounded />
            </IconButton>
          )}
        </Box>
      </Box>
    </Sheet>
  )
}
