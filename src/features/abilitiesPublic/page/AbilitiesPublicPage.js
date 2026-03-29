// features/abilitiesPublic/page/AbilitiesPublicPage.js

import React from 'react'
import Box from '@mui/joy/Box'

import PublicFormHeader from '../components/PublicFormHeader.js'
import PublicGrowthStageSection from '../components/PublicGrowthStageSection.js'
import PublicDomainsAccordion from '../components/PublicDomainsAccordion.js'
import PublicSubmitBar from '../components/PublicSubmitBar.js'
import { useAbilitiesPublicForm } from '../shared/abilitiesPublic.logic.js'

export default function AbilitiesPublicPage({ invite, onSubmit }) {
  const form = useAbilitiesPublicForm({ invite, onSubmit })

  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <PublicFormHeader form={form} />

        <Box sx={{ px: 1.25, pt: 0 }}>
          <PublicGrowthStageSection form={form} />
        </Box>

        <Box
          className="dpScrollThin"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            px: 1.25,
            pb: '96px',
          }}
        >
          <PublicDomainsAccordion form={form} />
        </Box>
      </Box>

      <PublicSubmitBar form={form} />
    </Box>
  )
}
