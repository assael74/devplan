// src/features/hub/controlCenter/mobile/ClubMobile.js

import React, { useMemo } from 'react'

import MobileView from '../shared/MobileView.js'
import { buildClubModel } from '../model/club.model.js'

export default function ClubMobile({ club, onBack, onOpenRoute }) {
  const model = useMemo(() => buildClubModel(club), [club])

  return (
    <MobileView
      model={model}
      onBack={onBack}
      onOpenRoute={onOpenRoute}
      emptyText="ללא פרטי מיקום"
    />
  )
}
