// src/features/hub/controlCenter/desktop/TeamDesktop.js

import React, { useMemo } from 'react'

import DesktopView from '../shared/DesktopView.js'
import { buildTeamModel } from '../model/team.model.js'

export default function TeamDesktop({ team, onOpenRoute }) {
  const model = useMemo(() => buildTeamModel(team), [team])

  return (
    <DesktopView
      model={model}
      onOpenRoute={onOpenRoute}
      emptyText="ללא פרטי שיוך"
    />
  )
}
