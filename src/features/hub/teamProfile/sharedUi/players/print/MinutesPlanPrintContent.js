// src/features/hub/teamProfile/sharedUi/players/print/MinutesPlanPrintContent.js

import React from 'react'

import {
  SquadTable,
  SummarySection,
} from './PlayersPrintShared.js'

export default function MinutesPlanPrintContent({ model }) {
  return (
    <>
      <SummarySection
        title='מעמד בסגל'
        subtitle='חלוקת תפקידי הסגל לצורך תכנון דקות המשחק'
        items={model.squadRoleSummary}
        columns={model.squadRoleSummary.length}
      />

      <SquadTable
        rows={model.rows}
        columns={model.columns}
        showSquadRole
      />
    </>
  )
}
