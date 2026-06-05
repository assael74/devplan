// src/features/liveTagging/ui/drawer/flow/LiveTaggingFlowDrawer.js

import React from 'react'
import { Drawer, ModalClose } from '@mui/joy'

import { LiveQualityStep } from './LiveQualityStep.js'
import { LiveZoneStep } from './LiveZoneStep.js'
import { flowDrawerSx as sx } from './sx/flowDrawer.sx.js'

export function LiveTaggingFlowDrawer({
  open,
  step,
  baseAction,
  selectedAction,
  selectedSide,
  onClose,
  onQualityClick,
  onBackToQuality,
  onZoneClick,
}) {
  const isZoneStep = step === 'zone'

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        content: {
          sx: sx.drawer(isZoneStep),
        },
      }}
    >
      <ModalClose />

      {step === 'quality' && (
        <LiveQualityStep
          action={baseAction}
          onQualityClick={onQualityClick}
        />
      )}

      {step === 'zone' && (
        <LiveZoneStep
          baseAction={baseAction}
          selectedAction={selectedAction}
          selectedSide={selectedSide}
          onBack={onBackToQuality}
          onZoneClick={onZoneClick}
        />
      )}
    </Drawer>
  )
}
