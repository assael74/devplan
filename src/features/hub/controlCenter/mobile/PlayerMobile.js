// src/features/hub/controlCenter/mobile/PlayerMobile.js

import React, { useMemo } from 'react'

import MobileView from '../shared/MobileView.js'
import { buildPlayerModel } from '../model/player.model.js'

export default function PlayerMobile({ player, onBack, onOpenRoute }) {
  const model = useMemo(() => buildPlayerModel(player), [player])

  return (
    <MobileView
      model={model}
      onBack={onBack}
      onOpenRoute={onOpenRoute}
      emptyText="ללא פרטי שיוך"
    />
  )
}
