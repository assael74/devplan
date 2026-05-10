// teamProfile/sharedUi/insights/teamGames/sections/shared/MetricCardView.js

import React, { useState } from 'react'
import { Box, Modal, ModalClose, Sheet } from '@mui/joy'

import MetricMiniCard from '../../../../../../../../ui/patterns/insights/ui/MetricMiniCard.js'

import TooltipContent from '../tooltip/TooltipContent.js'

function hasTooltip(item) {
  return Boolean(item?.tooltip)
}

function buildTooltip(item) {
  if (!hasTooltip(item)) return null

  return (
    <TooltipContent
      title={item.tooltip?.title}
      rows={item.tooltip?.rows}
    />
  )
}

function MetricInfoModal({ open, onClose, children }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'grid',
        placeItems: 'center',
        px: 2,
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: 'min(420px, 100%)',
          maxHeight: '72vh',
          overflowY: 'auto',
          borderRadius: 'lg',
          bgcolor: 'background.level1',
          boxShadow: 'lg',
          p: 1.5,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <ModalClose />

        {children}
      </Sheet>
    </Modal>
  )
}

function MetricMiniCardBase({ item, tooltip, isMobile }) {
  return (
    <MetricMiniCard
      label={item.label}
      value={item.value}
      sub={item.sub}
      icon={item.icon}
      color={item.color}
      tooltip={tooltip}
      isMobile={isMobile}
    />
  )
}

function DesktopMetricCard({ item }) {
  const tooltip = buildTooltip(item)

  return (
    <MetricMiniCardBase
      item={item}
      tooltip={tooltip}
      isMobile={false}
    />
  )
}

function MobileMetricCard({ item }) {
  const [open, setOpen] = useState(false)
  const tooltip = buildTooltip(item)
  const clickable = Boolean(tooltip)

  function handleClick(event) {
    event.stopPropagation()

    if (!clickable) return

    setOpen(true)
  }

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          position: 'relative',
          minWidth: 0,
          cursor: clickable ? 'pointer' : 'default',
          borderRadius: 'md',
          border: clickable ? '1px solid' : '1px solid transparent',
          borderColor: clickable ? `${item.color || 'neutral'}.outlinedBorder` : 'transparent',
          transition: '120ms ease',
          boxShadow: 'lg',

          '&:active': clickable
            ? {
                transform: 'scale(0.985)',
                opacity: 0.88,
              }
            : {},
        }}
      >
        <MetricMiniCardBase
          item={item}
          tooltip={null}
        />

        {clickable ? (
          <Box
            sx={{
              position: 'absolute',
              bottom: 7,
              left: 5,
              insetInlineEnd: 7,
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'background.level1',
              color: `${item.color || 'neutral'}.plainColor`,
              border: '1px solid',
              borderColor: `${item.color || 'neutral'}.outlinedBorder`,
              fontSize: 12,
              fontWeight: 700,
              pointerEvents: 'none',
            }}
          >
            i
          </Box>
        ) : null}
      </Box>

      {clickable ? (
        <MetricInfoModal
          open={open}
          onClose={() => setOpen(false)}
        >
          {tooltip}
        </MetricInfoModal>
      ) : null}
    </>
  )
}

export default function MetricCardView({ item, isMobile = false }) {
  if (isMobile) {
    return (
      <MobileMetricCard item={item} />
    )
  }

  return (
    <DesktopMetricCard item={item} />
  )
}
