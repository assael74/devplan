// features/playersDatabase/components/profilesPage/ProfilesPageHeader.js

import React from 'react'
import { Button } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { DatabaseHeader } from '../sharedUi/index.js'

export default function ProfilesPageHeader({ kpis = [], onBack }) {
  return (
    <DatabaseHeader
      eyebrow="PLAYERS DATABASE"
      title="תצוגת פרופילי סקאוט"
      kpis={kpis}
      actions={
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          endDecorator={iconUi({ id: 'back', sx: { color: '#ffffff'} })}
          onClick={onBack}
        >
          חזרה לעמוד ראשי
        </Button>
      }
    />
  )
}
