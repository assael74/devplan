// src/features/hub/teamProfile/desktop/modules/games/components/details/TeamTrendPanel.js

import React from 'react'

import TrendPanel from './TrendPanel.js'

import {
  buildTeamTrendPanelModel,
} from '../../../../../sharedLogic/games/index.js'

export default function TeamTrendPanel({ model, onClose }) {
  const view = React.useMemo(() => {
    return buildTeamTrendPanelModel(model)
  }, [model])

  return (
    <TrendPanel
      view={view}
      title="מגמת השפעה קבוצתית"
      legend="כל נקודה מייצגת משחק קבוצה. ירוק מעל קו הציפייה, אדום מתחת לקו הציפייה."
      onClose={onClose}
    />
  )
}
