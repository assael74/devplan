// src/features/liveTagging/LiveTaggingPanel.js

import React from 'react'

import { useLiveTaggingPanelModel } from './hooks/useLiveTaggingPanelModel.js'
import { LiveTaggingDesktopContainer } from './LiveTaggingDesktopContainer.js'
import { LiveTaggingMobileContainer } from './LiveTaggingMobileContainer.js'

export default function LiveTaggingPanel(props) {
  const model = useLiveTaggingPanelModel(props)

  return (
    <>
      <LiveTaggingMobileContainer model={model} />
      <LiveTaggingDesktopContainer model={model} />
    </>
  )
}
