// features/home/mobile/screens/HomeEntryScreenMobile.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import InProgressCardMobile from '../components/InProgressCardMobile.js'
import WorkspaceActionCardMobile from '../components/WorkspaceActionCardMobile.js'

import { workSpaceSx as sx } from './sx/workSpace.sx'

export default function HomeEntryScreenMobile({
  buckets,
  inProgressBucket,
  onOpenInProgress,
  onOpenWorkspace,
}) {
  return (
    <Box sx={sx.root}>
    <Box sx={{ px: 0.25 }}>
      <Typography level="h3" sx={{ fontWeight: 950 }} endDecorator={iconUi({ id: 'workspace' })}>
        שולחן עבודה אישי
      </Typography>

      <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.25, fontSize: 12 }}>
        בחר אזור עבודה או פתח את המשימות שנמצאות בתהליך
      </Typography>
    </Box>

      <InProgressCardMobile
        bucket={inProgressBucket}
        onClick={onOpenInProgress}
      />

      <Box sx={sx.homeWraper}>
        <WorkspaceActionCardMobile
          id="taskAnalyst"
          title="אזור משימות אנליסט"
          subtitle="מועדון, שחקנים, פגישות ואנליזה"
          iconId="Analyst"
          items={buckets.analyst}
          onClick={() => onOpenWorkspace('analyst')}
        />

        <WorkspaceActionCardMobile
          id="taskApp"
          title="אזור משימות אפליקציה"
          subtitle="פיתוח, UX, דאטה וארכיטקטורה"
          iconId="app"
          items={buckets.app}
          onClick={() => onOpenWorkspace('app')}
        />
      </Box>
    </Box>
  )
}
