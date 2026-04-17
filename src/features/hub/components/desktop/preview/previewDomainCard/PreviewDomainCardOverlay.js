// components/desktop/preview/PreviewDomainCard/PreviewDomainCardOverlay.js

import React, { useMemo } from 'react'
import { Box, Drawer, DialogContent, ModalClose, Divider, Sheet, IconButton } from '@mui/joy'

import PreviewDomainCardHeader from './PreviewDomainCardHeader'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'
import { getDomainDef } from './domainRegistry'
import { getEntityKind } from './utils/getEntityKind'
import { overlaySx as sx } from './sx/previewDomainCardOverlay.sx.js'

export default function PreviewDomainCardOverlay({
  d,
  open,
  entity,
  onClose,
  setOpen,
  context,
  fullName,
  onSaveInfo,
  playerPhoto,
  videoActions,
  birthYearText,
  restoreFocusRef
}) {

  const def = useMemo(() => {
    if (!d?.key) return null
    const entityKind = getEntityKind(entity)
    return getDomainDef(entityKind, d.key)
  }, [d?.key, entity])

  const handleClose = (...args) => {
    onClose(...args)
    setOpen(false)
  }

  const domainImg = def?.image || null
  const DomainModal = def?.Modal

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
      size="lg"
      variant="plain"
      anchor="bottom"
      open={open}
      disableRestoreFocus
      disableEnforceFocus
      onClose={handleClose}
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

      <DialogContent sx={{ gap: 2, minWidth: 0, width: '100%' }}>
        <Box sx={sx.bodyScrollSx} className="dpScrollThin">
          <Box sx={{ width: '100%', minWidth: 0 }}>
            {content}
          </Box>
        </Box>
      </DialogContent>
      </Sheet>
    </Drawer>
  )
}
