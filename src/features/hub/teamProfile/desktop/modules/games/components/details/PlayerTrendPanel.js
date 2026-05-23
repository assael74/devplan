// src/features/hub/teamProfile/desktop/modules/games/components/details/PlayerTrendPanel.js

import React from 'react'

import TrendPanel from './TrendPanel.js'

import {
  buildPlayerTrendPanelModel,
} from '../../../../../sharedLogic/games/index.js'

export default function PlayerTrendPanel({ model, onClose }) {
  const view = React.useMemo(() => {
    return buildPlayerTrendPanelModel(model)
  }, [model])

  return (
    <TrendPanel
      view={view}
      title="מגמת השפעה מצטברת"
      onClose={onClose}
    />
  )
}
