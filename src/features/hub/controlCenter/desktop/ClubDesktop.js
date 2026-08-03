// src/features/hub/controlCenter/desktop/ClubDesktop.js

import React, { useMemo } from 'react'

import DesktopView from '../shared/DesktopView.js'
import { buildClubModel } from '../model/club.model.js'

export default function ClubDesktop({ club, onOpenRoute }) {
  const model = useMemo(() => buildClubModel(club), [club])

  return (
    <DesktopView
      model={model}
      onOpenRoute={onOpenRoute}
      emptyText="ללא פרטי מיקום"
    />
  )
}
