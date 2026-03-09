// teamProfile/modules/players/components/TeamPlayerRow.js
import React from 'react'
import { Box, Chip, Avatar, Typography, IconButton, Tooltip, Divider } from '@mui/joy'
import EditRounded from '@mui/icons-material/EditRounded'
import SportsSoccerRounded from '@mui/icons-material/SportsSoccerRounded'
import PersonRounded from '@mui/icons-material/PersonRounded'

import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import JoyStarRatingStatic from '../../../../../../ui/domains/ratings/JoyStarRating'
import EntityActionsMenu from '../../../../sharedProfile/EntityActionsMenu.js'

const typeLabel = (t) => (t === 'project' ? 'פרויקט' : 'כללי')
const typeColor = (t) => (t === 'project' ? 'primary' : 'neutral')

export default function TeamPlayerRow({ r, sx, crud, onAvatarClick }) { // ✅ חדש
  const clickable = typeof onAvatarClick === 'function'

  return (
    <Box sx={sx.row}>
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
        <Avatar src={r.photo || playerImage}>
          <PersonRounded />
        </Avatar>

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

      {/* ... כל השאר ללא שינוי ... */}

      <Box sx={{ display: 'grid', gap: 0.4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography level="title-sm">{r.fullName}</Typography>

          <Chip size="sm" color={r.isKey ? 'success' : 'neutral'} variant="soft" startDecorator={iconUi({ id: 'keyPlayer' })}>
            שחקן מפתח
          </Chip>

          <Chip size="sm" color={r.active ? 'success' : 'neutral'} variant="soft" startDecorator={iconUi({ id: 'active' })}>
            {r.active ? 'פעיל' : 'לא פעיל'}
          </Chip>

          <Chip
            size="sm"
            color={typeColor(r.type)}
            variant="soft"
            startDecorator={iconUi({ id: r.type, sx: { '& svg': { width: 14, height: 14 } } })}
          >
            {typeLabel(r.type)}
          </Chip>

          {!!r.birthDay && (
            <Chip size="sm" variant="soft">
              {r.birthDay}
            </Chip>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography level="body-xs" sx={{ opacity: 0.7 }}>
            רמה
          </Typography>
          <Tooltip title={Number(r.level)}>
            <span>
              <JoyStarRatingStatic value={Number(r.level) || 0} size="xs" />
            </span>
          </Tooltip>

          <Divider orientation="vertical" />

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(r.positions || []).slice(0, 4).map((p) => (
              <Chip key={p} size="sm" variant="outlined">
                {p}
              </Chip>
            ))}
            {(r.positions || []).length > 4 && (
              <Chip size="sm" variant="outlined">
                +{(r.positions || []).length - 4}
              </Chip>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={sx.actions}>
        <Tooltip title="עריכה כללית">
          <IconButton size="sm" onClick={() => crud.openEdit(r)}>
            <EditRounded />
          </IconButton>
        </Tooltip>

        <Tooltip title="עריכת עמדה">
          <IconButton size="sm" onClick={() => crud.openPositions(r)}>
            <SportsSoccerRounded />
          </IconButton>
        </Tooltip>

        <EntityActionsMenu
          entityType="player"
          entityId={r.id}
          entityName={r.fullName}
          metaCounts={r.metaCounts || null}
          disabled={false}
        />
      </Box>
    </Box>
  )
}
