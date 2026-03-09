// clubProfile/modules/teams/components/ClubTeamRow.js
import React from 'react'
import { Box, Chip, Avatar, Typography, IconButton, Tooltip, Divider } from '@mui/joy'
import EditRounded from '@mui/icons-material/EditRounded'
import ToggleOnRounded from '@mui/icons-material/ToggleOnRounded'
import SportsSoccerRounded from '@mui/icons-material/SportsSoccerRounded'
import PersonRounded from '@mui/icons-material/PersonRounded'

import teamImage from '../../../../../../ui/core/images/teamImage.png'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import JoyStarRatingStatic from '../../../../../../ui/domains/ratings/JoyStarRating'
import EntityActionsMenu from '../../../../sharedProfile/EntityActionsMenu.js'

const typeLabel = (t) => (t === 'project' ? 'פרויקט' : 'כללי')
const typeColor = (t) => (t === 'project' ? 'primary' : 'neutral')

export default function ClubTeamRow({ r, sx, crud }) {
  return (
    <Box sx={sx.row}>
      <Avatar src={r.photo || teamImage}>
        <PersonRounded />
      </Avatar>

      <Box sx={{ display: 'grid', gap: 0.4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography level="title-sm">{r.fullName}</Typography>

          <Chip size="sm" color={r.active ? 'success' : 'neutral'} variant="soft">
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

          {!!r.birth && (
            <Chip size="sm" variant="soft">
              {r.birth}
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

          </Box>
        </Box>
      </Box>

      <Box sx={sx.actions}>
        <Tooltip title='עריכה כללית'>
          <IconButton size='sm' onClick={() => crud.openEdit(r)}>
            <EditRounded />
          </IconButton>
        </Tooltip>

        <EntityActionsMenu
          entityType="team"
          entityId={r.id}
          entityName={r.teamName}
          metaCounts={r.metaCounts || null}
          disabled={false}
          isArchived={r?.active === false}
        />
      </Box>
    </Box>
  )
}
