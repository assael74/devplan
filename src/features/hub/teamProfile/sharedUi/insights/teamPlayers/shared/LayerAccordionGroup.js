// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/LayerAccordionGroup.js

import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
} from '@mui/joy'

import { layersSx as sx } from './sx/layers.sx.js'

const emptyArray = []

export default function LayerAccordionGroup({
  layers = emptyArray,
  renderSummary,
  renderContent,
}) {
  const safeLayers = Array.isArray(layers) ? layers : emptyArray

  if (!safeLayers.length) return null

  return (
    <AccordionGroup variant="plain" disableDivider sx={sx.group}>
      {safeLayers.map(layer => (
        <Accordion key={layer.id}>
          <AccordionSummary>
            {typeof renderSummary === 'function'
              ? renderSummary(layer)
              : null}
          </AccordionSummary>

          <AccordionDetails>
            {typeof renderContent === 'function'
              ? renderContent(layer)
              : null}
          </AccordionDetails>
        </Accordion>
      ))}
    </AccordionGroup>
  )
}
