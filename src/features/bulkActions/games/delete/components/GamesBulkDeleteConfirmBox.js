// src/features/bulkActions/games/delete/components/GamesBulkDeleteConfirmBox.js

import React from 'react'
import {
  Box,
  FormControl,
  FormHelperText,
  Input,
  Typography,
} from '@mui/joy'

import { GAMES_DELETE_SCOPE } from '../configs/gamesDelete.config.js'
import { gamesDeleteModalSx as sx } from '../sx/gamesDeleteModal.sx.js'

export function getGamesDeleteConfirmModel(plan = {}) {
  const totalGames = plan?.summary?.totalGames || 0

  if (plan?.scope === GAMES_DELETE_SCOPE.ALL_TEAM_GAMES) {
    return {
      expectedText: plan?.teamName || '',
      title: 'אישור מחיקת כל משחקי הקבוצה',
      label: 'הקלד את שם הקבוצה לאישור',
      helper: `נדרשת הקלדה מדויקת: ${plan?.teamName || '-'}`,
    }
  }

  return {
    expectedText: String(totalGames),
    title: 'אישור מחיקת משחקים',
    label: 'הקלד את מספר המשחקים למחיקה',
    helper: `נדרשת הקלדה מדויקת: ${totalGames}`,
  }
}

export function isGamesDeleteConfirmed(plan, value) {
  const model = getGamesDeleteConfirmModel(plan)

  return String(value || '').trim() ===
    String(model.expectedText || '').trim()
}

export default function GamesBulkDeleteConfirmBox({
  plan,
  value,
  onChange,
}) {
  const model = getGamesDeleteConfirmModel(plan)

  return (
    <Box sx={sx.confirmBox}>
      <Typography level="title-sm" color="danger">
        {model.title}
      </Typography>

      <Typography level="body-sm">
        הפעולה תמחק את המשחקים שנבחרו ואת הנתונים המקושרים אליהם לפי
        לוגיקת המחיקה המרכזית.
      </Typography>

      <FormControl>
        <Typography level="body-xs" sx={{ mb: 0.5 }}>
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
