// clubProfile/mobile/modules/teams/components/teamCard/ClubTeamCardDetails.js

import React from 'react'
import { Box, Button, Chip, Divider, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function ClubTeamCardDetails({ row, onEditTeam }) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ display: 'grid', gap: 0.6 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          נתוני קבוצה
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip size="sm" variant="soft" color="primary" startDecorator={iconUi({ id: 'players' })}>
            שחקנים {row?.playersCount ?? 0}
          </Chip>

          <Chip size="sm" variant="soft" color="warning" startDecorator={iconUi({ id: 'keyPlayer' })}>
            מפתח {row?.keyPlayersCount ?? 0}
          </Chip>

          <Chip size="sm" variant="soft" color={row?.active ? 'success' : 'danger'} startDecorator={iconUi({ id: row?.active ? 'active' : 'close' })}>
            {row?.active ? 'פעילה' : 'לא פעילה'}
          </Chip>

          {row?.isProject && (
            <Chip size="sm" variant="soft" color="success" startDecorator={iconUi({ id: 'project' })}>
              פרויקט
            </Chip>
          )}
        </Box>
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {!!row?.league && (
          <Chip size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'league' })}>
            {row.league}
          </Chip>
        )}

        {row?.leaguePosition != null && (
          <Chip size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'table' })}>
            מקום {row.leaguePosition}
          </Chip>
        )}

        {row?.points != null && (
          <Chip size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'score' })}>
            {row.points} נק׳
          </Chip>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="sm"
          variant="plain"
          startDecorator={iconUi({ id: 'edit' })}
          onClick={() => onEditTeam?.(row?.team || row)}
        >
          עריכת קבוצה
        </Button>
      </Box>
    </Box>
  )
}
