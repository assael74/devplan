import React from 'react'
import Box from '@mui/joy/Box'

import { useAbilitiesPublicForm } from '../shared/abilitiesPublic.logic.js'
import PublicFormHeader from '../components/PublicFormHeader.js'
import PublicGrowthStageSection from '../components/PublicGrowthStageSection.js'
import PublicDomainsAccordion from '../components/PublicDomainsAccordion.js'
import PublicSubmitBar from '../components/PublicSubmitBar.js'
import PublicStateView from '../components/PublicStateView.js'

export default function AbilitiesPublicPage({ invite, onSubmit }) {
  const form = useAbilitiesPublicForm({ invite, onSubmit })

  if (!invite) {
    return (
      <PublicStateView
        color="danger"
        title="קישור לא תקין"
        text="לא נמצא invite תקין לטופס."
      />
    )
  }

  if (form.submitted) {
    return (
      <PublicStateView
        color="success"
        title="הטופס נשלח בהצלחה"
        text={`הערכת היכולות עבור ${form.bits.playerName || 'השחקן'} התקבלה.`}
      />
    )
  }

  return (
    <>
      <Box sx={{ maxWidth: 720, mx: 'auto', px: 1.5, pb: 10 }}>
        <PublicFormHeader form={form} />
        <PublicGrowthStageSection form={form} />
        <PublicDomainsAccordion form={form} />
      </Box>

      <PublicSubmitBar form={form} />
    </>
  )
}
