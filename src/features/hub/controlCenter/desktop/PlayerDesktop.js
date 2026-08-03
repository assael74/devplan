// src/features/hub/controlCenter/desktop/PlayerDesktop.js

import React, { useMemo } from 'react'

import DesktopView from '../shared/DesktopView.js'
import { buildPlayerModel } from '../model/player.model.js'

export default function PlayerDesktop({ player, onOpenRoute }) {
  const model = useMemo(() => buildPlayerModel(player), [player])

  return (
    <DesktopView
      model={model}
      onOpenRoute={onOpenRoute}
      emptyText="ללא פרטי שיוך"
    />
  )
}
