/// C:\projects\devplan\src\features\hub\components\preview\previewDomainCard\domains\club\staff\ClubStaffDomainModal.js

import React from 'react'
import { Box, Divider } from '@mui/joy'

import ManagementStaffCard from '../../../../../../../../ui/domains/staff'
import { modalSx } from './clubStaff.sx'

export default function ClubStaffDomainModal({ entity, context }) {
  return (
    <Box sx={modalSx.root}>
      <ManagementStaffCard
        title="צוות מקצועי"
        subtitle="ניהול שיוך אנשי צוות למועדון"
        clubId={entity?.id}
        roles={Array.isArray(context?.roles) ? context.roles : []}
        context={context}
      />
    </Box>
  )
}
