// src/features/players/components/preview/PreviewDomainCard/PreviewDomainCardOverlay.js

import React, { useRef, useState, useMemo } from 'react'
import {
  Modal,
  ModalDialog,
  Divider,
  Drawer,
  Sheet,
  Box,
  ModalClose,
  DialogContent,
  IconButton,
} from '@mui/joy'
import CloseRounded from '@mui/icons-material/CloseRounded'

import PreviewDomainCardHeader from './PreviewDomainCardHeader'
import { getDomainDef } from './domainRegistry'
import { getEntityKind } from './utils/getEntityKind'

import { overlaySx as sx } from './PreviewDomainCardOverlay.sx'

export default function PreviewDomainCardOverlay({
  d,
  entity,
  open,
  onClose,
  state,
  playerPhoto,
  fullName,
  context,
  videoActions,
  birthYearText,
  onSaveInfo,
}) {
  const nodeRef = useRef(null)
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
    <DialogContent sx={sx.dialogContentSx}>תוכן יתווסף בהמשך</DialogContent>
  )

  if (container === 'modal') {
    return (
      <Modal open={open} onClose={onClose} sx={sx.modalSx(nodeRef, state)}>
        <ModalDialog sx={sx.modalDialogSx(state)}>
          <ModalClose />
          <PreviewDomainCardHeader
            label={d?.label}
            playerPhoto={playerPhoto}
            fullName={fullName}
            birthYearText={birthYearText}
            domainImg={domainImg}
          />
          <Divider sx={sx.dividerSx} />
          <Box sx={sx.bodyScrollSx} className="dpScrollThin">{content}</Box>
        </ModalDialog>
      </Modal>
    )
  }

  return (
    <Drawer open={open} onClose={onClose} anchor="bottom" size="sm" slotProps={sx.drawerSlotProps}>
      <Sheet variant="outlined" sx={sx.drawerSheetSx}>
        <Box sx={sx.handleWrapSx}>
          <Box sx={sx.handleBarSx} />
        </Box>

        <Box sx={sx.headerWrapSx}>
          <Box sx={sx.headerMainSx}>
            <PreviewDomainCardHeader
              variant="drawer"
              label={d?.label}
              playerPhoto={playerPhoto}
              fullName={fullName}
              birthYearText={birthYearText}
              domainImg={domainImg}
            />
          </Box>

          <IconButton size="sm" variant="soft" sx={sx.closeBtnSx} onClick={onClose}>
            <CloseRounded />
          </IconButton>
        </Box>

        <Box sx={sx.bodyScrollSx}>{content}</Box>
      </Sheet>
    </Drawer>
  )
}
