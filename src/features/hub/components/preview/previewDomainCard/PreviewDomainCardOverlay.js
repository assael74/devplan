// src/features/players/components/preview/PreviewDomainCard/PreviewDomainCardOverlay.js

import React, { useRef, useState, useMemo } from 'react'
import { Box, Drawer, DialogContent, ModalClose, Divider, Sheet, Typography } from '@mui/joy';

import PreviewDomainCardHeader from './PreviewDomainCardHeader'

import { getDomainDef } from './domainRegistry'
import { getEntityKind } from './utils/getEntityKind'
import { overlaySx as sx } from './sx/previewDomainCardOverlay.sx.js'

export default function PreviewDomainCardOverlay({
  d,
  entity,
  open,
  onClose,
  setOpen,
  playerPhoto,
  fullName,
  context,
  videoActions,
  birthYearText,
  onSaveInfo,
}) {
  const def = useMemo(() => {
    if (!d?.key) return null
    const entityKind = getEntityKind(entity)
    return getDomainDef(entityKind, d.key)
  }, [d?.key, entity])

  const domainImg = def?.image || null
  const DomainModal = def?.Modal
  const container = def?.container || 'modal'
  const content = DomainModal ? (
    <DomainModal
      d={d}
      items={d?.data || []}
      entity={entity}
      context={context}
      videoActions={videoActions}
      onClose={onClose}
      onSave={onSaveInfo}
    />
  ) : (
    <DialogContent>תוכן יתווסף בהמשך</DialogContent>
  )

  return (
    <Drawer
      size="md"
      variant="plain"
      anchor='bottom'
      open={open}
      onClose={() => setOpen(false)}
      slotProps={{
        content: {
          sx: sx.drawerSlot,
        },
      }}
    >
      <Sheet sx={sx.dialogSheetSx}>
        <ModalClose />
        <PreviewDomainCardHeader
          label={d?.label}
          playerPhoto={playerPhoto}
          fullName={fullName}
          birthYearText={birthYearText}
          domainImg={domainImg}
        />
        <Divider sx={{ mt: 'auto' }} />
        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.bodyScrollSx} className="dpScrollThin">{content}</Box>
        </DialogContent>
        <Box sx={{ height: 5 }} />
      </Sheet>
    </Drawer>
  );
}
