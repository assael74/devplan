// src/features/hub/clubProfile/modules/players/components/ClubPlayerRow.js
import React from 'react'
import { Box, Avatar, Typography, Chip, IconButton, Tooltip } from '@mui/joy'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'

import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import EntityActionsMenu from '../../../../sharedProfile/EntityActionsMenu.js'

const fmt = (v) => (v == null || v === '' ? '—' : String(v))

export default function ClubPlayerRow({ r, sx, onOpenPlayer, onAvatarClick }) { // ✅ חדש
  const clickable = typeof onAvatarClick === 'function'

  return (
    <tr>
      <td>
        <Box sx={sx.nameCell}>
          <Box
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onAvatarClick(r) : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onAvatarClick(r)
                    }
                  }
                : undefined
            }
            sx={{
              position: 'relative',
              lineHeight: 0,
              borderRadius: 999,
              cursor: clickable ? 'pointer' : 'default',
              '&:hover ._rowAvatarOverlay': clickable ? { opacity: 1 } : undefined,
              '&:focus-visible': clickable
                ? { outline: '2px solid', outlineColor: 'primary.400', outlineOffset: 2 }
                : undefined,
            }}
          >
            <Avatar src={r.photo || playerImage} />

            {clickable ? (
              <Box
                className="_rowAvatarOverlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                  bgcolor: 'rgba(0,0,0,0.28)',
                  opacity: 0,
                  transition: 'opacity 140ms ease',
                  pointerEvents: 'none',
                }}
              />
            ) : null}
          </Box>

          <Box sx={sx.nameText}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography level="title-sm">{r.fullName}</Typography>
              <Chip size="sm" variant="soft" color={r.active ? 'success' : 'neutral'}>
                {r.active ? 'פעיל' : 'לא פעיל'}
              </Chip>
            </Box>
            <Typography level="body-xs" sx={{ opacity: 0.7 }}>
              {r.teamName} • {r.teamYear}
            </Typography>
          </Box>
        </Box>
      </td>

      <td><Typography level="body-sm">{fmt(r.teamName)}</Typography></td>
      <td><Typography level="body-sm">{fmt(r.potential)}</Typography></td>
      <td><Typography level="body-sm">{fmt(r.minutes)}</Typography></td>
      <td><Typography level="body-sm">{fmt(r.goals)}</Typography></td>
      <td><Typography level="body-sm">{fmt(r.assists)}</Typography></td>

      <td>
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="פתח פרופיל שחקן">
            <IconButton size="sm" onClick={() => onOpenPlayer(r)}>
              <OpenInNewRounded />
            </IconButton>
          </Tooltip>

          <EntityActionsMenu
            entityType="player"
            entityId={r.id}
            entityName={r.fullName}
            metaCounts={r?.metaCounts || null}
            disabled={false}
            isArchived={r?.active === false}
          />
        </Box>
      </td>
    </tr>
  )
}
