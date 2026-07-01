// src/features/bulkActions/players/delete/components/PlayersBulkDeleteConfirmBox.js

import React from 'react'
import { Box, FormControl, FormHelperText, Input, Typography } from '@mui/joy'

import { PLAYERS_DELETE_SCOPE } from '../configs/playersDelete.config.js'
import { playersDeleteModalSx as sx } from './sx/playersDeleteModal.sx.js'

export function getPlayersDeleteConfirmModel(plan = {}) {
  const totalPlayers = plan?.summary?.totalPlayers || 0

  if (plan?.scope === PLAYERS_DELETE_SCOPE.ALL_TEAM_PLAYERS) {
    return {
      expectedText: plan?.teamName || '',
      title: 'אישור מחיקת כל שחקני הקבוצה',
      label: 'הקלד את שם הקבוצה לאישור',
      helper: `נדרשת הקלדה מדויקת: ${plan?.teamName || '-'}`,
    }
  }

  return {
    expectedText: String(totalPlayers),
    title: 'אישור מחיקת שחקנים',
    label: 'הקלד את מספר השחקנים למחיקה',
    helper: `נדרשת הקלדה מדויקת: ${totalPlayers}`,
  }
}

export function isPlayersDeleteConfirmed(plan, value) {
  const model = getPlayersDeleteConfirmModel(plan)

  return String(value || '').trim() === String(model.expectedText || '').trim()
}

export default function PlayersBulkDeleteConfirmBox({ plan, value, onChange }) {
  const model = getPlayersDeleteConfirmModel(plan)

  return (
    <Box sx={sx.confirmBox}>
      <Typography level="title-sm" color="danger">
        {model.title}
      </Typography>

      <Typography level="body-sm">
        הפעולה תמחק את השחקנים, הנתונים המקושרים שלהם ואת התמונות שלהם
        מ־Firebase Storage.
      </Typography>

      <FormControl>
        <Typography level="body-xs" sx={sx.confirmLabel}>
          {model.label}
        </Typography>

        <Input
          size="sm"
          value={value}
          placeholder={model.expectedText}
          onChange={event => onChange?.(event.target.value)}
        />

        <FormHelperText>
          {model.helper}
        </FormHelperText>
      </FormControl>
    </Box>
  )
}
