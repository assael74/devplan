// src/features/bulkActions/videos/delete/components/VideosBulkDeleteConfirmBox.js

import React from 'react'

import {
  Box,
  FormControl,
  FormHelperText,
  Input,
  Typography,
} from '@mui/joy'

import {
  videosDeleteModalSx as sx,
} from '../sx/videosDeleteModal.sx.js'

export function getVideosDeleteConfirmModel(plan = {}) {
  const totalVideos = plan?.summary?.totalVideos || 0

  return {
    expectedText: String(totalVideos),
    title: 'אישור מחיקת קטעי וידאו',
    label: 'הקלד את מספר קטעי הווידאו למחיקה',
    helper: `נדרשת הקלדה מדויקת: ${totalVideos}`,
  }
}

export function isVideosDeleteConfirmed(plan, value) {
  const model = getVideosDeleteConfirmModel(plan)

  return (
    String(value || '').trim() ===
    String(model.expectedText || '').trim()
  )
}

export default function VideosBulkDeleteConfirmBox({
  plan,
  value,
  onChange,
}) {
  const model = getVideosDeleteConfirmModel(plan)

  return (
    <Box sx={sx.confirmBox}>
      <Typography level="title-sm" color="danger">
        {model.title}
      </Typography>

      <Typography level="body-sm">
        הפעולה תמחק את קטעי הווידאו שנבחרו. לא ניתן לבטל את הפעולה לאחר השלמתה.
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
