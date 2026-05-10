// teamProfile/sharedUi/insights/teamGames/sections/insight/InsightDetailsMenu.js

import React, { useState } from 'react'
import { Box, Modal, ModalClose, Sheet, Typography } from '@mui/joy'

export default function InsightDetailsMenu({
  items = [],
  color = 'primary',
  buttonText = 'למה זו ההמלצה?',
}) {
  const [open, setOpen] = useState(false)

  const safeItems = Array.isArray(items)
    ? items.filter(Boolean)
    : []

  if (!safeItems.length) return <Box />

  return (
    <>
      <Typography
        component="button"
        type="button"
        level="body-xs"
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
        sx={{
          p: 0,
          m: 0,
          width: 'fit-content',
          border: 0,
          bgcolor: 'transparent',
          cursor: 'pointer',
          fontWeight: 700,
          color: `${color}.plainColor`,
          textDecoration: 'underline',
          textUnderlineOffset: '4px',

          '&:hover': {
            bgcolor: 'transparent',
            opacity: 0.82,
          },
        }}
      >
        {buttonText}
      </Typography>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
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
            maxHeight: '70vh',
            overflowY: 'auto',
            borderRadius: 'lg',
            bgcolor: 'background.level1',
            boxShadow: 'lg',
            p: 1.5,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <ModalClose />

          <Box sx={{ display: 'grid', gap: 1.1, pt: 1 }}>
            {safeItems.map((item) => (
              <DetailItem
                key={item.menuId || item.id || item.label}
                item={item}
              />
            ))}
          </Box>
        </Sheet>
      </Modal>
    </>
  )
}

function DetailItem({ item }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.35,
        minWidth: 0,
        pb: 0.9,
        borderBottom: '1px solid',
        borderColor: 'divider',

        '&:last-of-type': {
          pb: 0,
          borderBottom: 0,
        },
      }}
    >
      <Typography
        level="body-sm"
        sx={{
          fontWeight: item.isPrimary ? 700 : 600,
          lineHeight: 1.25,
          color: item.isPrimary ? 'text.primary' : 'text.secondary',
        }}
      >
        {item.isPrimary
          ? `${item.label} · עיקר התובנה`
          : item.label}
      </Typography>

      <Typography
        level="body-xs"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.45,
          whiteSpace: 'normal',
        }}
      >
        {item.text}
      </Typography>
    </Box>
  )
}
