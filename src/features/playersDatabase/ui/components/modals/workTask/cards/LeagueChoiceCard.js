// src/features/playersDatabase/ui/components/modals/workTask/cards/LeagueChoiceCard.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'

import {
  TABLE_STATUS,
  clean,
} from '../workTask.model.js'
import { workTaskCardsSx as sx } from '../sx/workTaskCards.sx.js'

export default function LeagueChoiceCard({ row, selected, onClick }) {
  const status = TABLE_STATUS[row.tableStatus] || TABLE_STATUS.missing
  const leagueName = clean(row.leagueName || row.name) || 'ליגה ללא שם'
  const seasonLabel = clean(row.seasonKey || row.seasonId) || 'עונה לא מוגדרת'
  const disabled = row.tableStatus === 'full'

  return (
    <Button
      disabled={disabled}
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.leagueCard,
        selected && sx.leagueCardSelected,
        disabled && sx.leagueCardDisabled,
      ]}
      onClick={disabled ? undefined : onClick}
    >
      <Box sx={sx.leagueCardHead}>
        <Typography sx={sx.leagueName}>
          {leagueName}
        </Typography>
        <Chip size='sm' color={status.tone} variant='soft'>
          {status.label}
        </Chip>
      </Box>

      <Box sx={sx.leagueSeasonWrap}>
        <Typography sx={sx.leagueSeasonLabel}>
          עונה
        </Typography>
        <Typography sx={sx.leagueSeasonValue}>
          {seasonLabel}
        </Typography>
      </Box>

      <Box sx={sx.leagueCardFoot}>
        <Typography level='body-xs' sx={sx.leagueTaskLabel}>
          {disabled ? 'אין משימת ליגה' : 'משימה צפויה'}
        </Typography>
        <Typography
          level='body-xs'
          sx={[
            sx.leagueAction,
            !disabled && sx.leagueActionActive,
          ]}
        >
          {status.action}
        </Typography>
      </Box>
    </Button>
  )
}
