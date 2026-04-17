// preview/previewDomainCard/domains/team/staff/TeamStaffDomainModal.js

import React from 'react'
import { Box, Divider } from '@mui/joy'

import ManagementStaffCard from '../../../../../../../../../ui/domains/staff'
import { TrainingSchedulePreview } from '../../../../../../../../../ui/patterns/schedule'
import { modalSx } from './sx/teamStaff.sx'

export default function TeamStaffDomainModal({ entity, context }) {
  return (
    <Box sx={modalSx.root}>
      <ManagementStaffCard
        title="צוות מקצועי"
        subtitle="ניהול שיוך אנשי צוות לקבוצה"
        teamId={entity?.id}
        roles={Array.isArray(context?.roles) ? context.roles : []}
        context={context}
      />

      <Divider />

      <TrainingSchedulePreview
        entity={entity}
        context={context}
        mode="modal"
        title="אימונים קרובים"
      />
    </Box>
  )
}
