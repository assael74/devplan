// playerProfile/desktop/modules/games/components/details/PlayerGameTrendPanel.js

import React from 'react'

import TrendPanel from './TrendPanel.js'

import {
  buildPlayerGameTrendPanelModel,
} from '../../../../../sharedLogic/games/module/index.js'

export default function PlayerGameTrendPanel({ model, onClose }) {
  const view = React.useMemo(() => {
    return buildPlayerGameTrendPanelModel(model)
  }, [model])

  return (
    <TrendPanel
      view={view}
      title="מגמת השפעה מצטברת"
      legend="כל נקודה מייצגת משחק של השחקן. ירוק מעל קו התרומה, אדום מתחת לקו התרומה."
      onClose={onClose}
    />
  )
}
