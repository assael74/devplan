// src/features/players/components/preview/PreviewDomainCard/PreviewDomainCardOverlay.js
import React, { useMemo } from 'react'
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

import {
  dialogContentSx,
  dividerSx,
  drawerSlotProps,
  drawerSheetSx,
  handleWrapSx,
  handleBarSx,
  headerWrapSx,
  headerMainSx,
  closeBtnSx,
  bodyScrollSx,
  modalDialogFrameSx,
} from './PreviewDomainCardOverlay.sx'

export default function PreviewDomainCardOverlay({
  d,
  entity,
  open,
  onClose,
  state,
  nodeRef,
  modalSx,
  modalDialogSx,
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
    <DialogContent sx={dialogContentSx}>תוכן יתווסף בהמשך</DialogContent>
  )

  if (container === 'modal') {
    return (
      <Modal open={open} onClose={onClose} sx={modalSx(nodeRef, state)}>
        <ModalDialog sx={{ ...modalDialogSx(state), ...modalDialogFrameSx }}>
          <ModalClose />
          <PreviewDomainCardHeader
            label={d?.label}
            playerPhoto={playerPhoto}
            fullName={fullName}
            birthYearText={birthYearText}
            domainImg={domainImg}
          />
          <Divider sx={dividerSx} />
          <Box sx={bodyScrollSx}>{content}</Box>
        </ModalDialog>
      </Modal>
    )
  }

  return (
    <Drawer open={open} onClose={onClose} anchor="bottom" size="sm" slotProps={drawerSlotProps}>
      <Sheet variant="outlined" sx={drawerSheetSx}>
        <Box sx={handleWrapSx}>
          <Box sx={handleBarSx} />
        </Box>

        <Box sx={headerWrapSx}>
          <Box sx={headerMainSx}>
            <PreviewDomainCardHeader
              variant="drawer"
              label={d?.label}
              playerPhoto={playerPhoto}
              fullName={fullName}
              birthYearText={birthYearText}
              domainImg={domainImg}
            />
          </Box>

          <IconButton size="sm" variant="soft" sx={closeBtnSx} onClick={onClose}>
            <CloseRounded />
          </IconButton>
        </Box>

        <Box sx={bodyScrollSx}>{content}</Box>
      </Sheet>
    </Drawer>
  )
}
