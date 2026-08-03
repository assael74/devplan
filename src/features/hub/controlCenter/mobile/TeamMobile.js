// src/features/hub/controlCenter/mobile/TeamMobile.js

import React, { useMemo } from 'react'

import MobileView from '../shared/MobileView.js'
import { buildTeamModel } from '../model/team.model.js'

export default function TeamMobile({ team, onBack, onOpenRoute }) {
  const model = useMemo(() => buildTeamModel(team), [team])

  return (
    <MobileView
      model={model}
      onBack={onBack}
      onOpenRoute={onOpenRoute}
      emptyText="ללא פרטי שיוך"
    />
  )
}
