// components/desktop/preview/previewDomainCard/PreviewDomainCard.js

import React, { useRef, useState } from 'react'
import { Box, Sheet, Tooltip, Typography, Divider } from '@mui/joy'
import { Transition } from 'react-transition-group'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'

import { DOMAIN_STATE } from '../preview.state'
import { getDomainDef } from './domainRegistry'
import { resolvePlayerUi } from './utils/playerUi'
import { getEntityKind } from './utils/getEntityKind'

import { cardSx as sx } from './sx/PreviewDomainCard.sx'

import PreviewDomainCardBody from './PreviewDomainCardBody'
import PreviewDomainCardOverlay from './PreviewDomainCardOverlay'

export default function PreviewDomainCard({
  d,
  onOpenDomain,
  entity,
  onSaveInfo,
  context,
  videoActions,
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const entityKind = getEntityKind(entity)
  const def = getDomainDef(entityKind, d.key)
  const isLocked = d.state === DOMAIN_STATE.LOCKED

  const playerUi = entityKind === 'player' ? resolvePlayerUi(entity) : { playerPhoto: null, fullName: null, birthYearText: null }

  const { playerPhoto, fullName, birthYearText } = playerUi

  const handleOpen = (e) => {
    if (isLocked) return
    setOpen(true)
  }

  return (
    <>
      <Sheet onClick={handleOpen} {...sx.sheetSx(isLocked)}>
        <Box sx={sx.cardHeaderSx}>
          <Box sx={sx.cardVisualColSx}>
            <Tooltip title={isLocked ? 'נעול' : `פתח ${d.label}`} placement="top" variant="solid">
              <Box
                ref={triggerRef}
                {...sx.boxWraperSx(isLocked)}
                tabIndex={isLocked ? -1 : 0}
                onClick={() => {
                  if (!isLocked) setOpen(true)
                }}
                onKeyDown={(e) => {
                  if (isLocked) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOpen(true)
                  }
                }}
               >
                {def?.visualType === 'icon' ? (
                  <Box {...sx.boxVisualSx(isLocked)}>
                    {iconUi({
                      id: def?.iconId || d?.key,
                      sx: {
                        fontSize: 26,
                        color: isLocked ? 'neutral.500' : 'primary.600',
                      },
                    })}
                  </Box>
                ) : (
                  <Box src={def?.image} {...sx.boxSx(isLocked)} />
                )}

                <Box {...sx.boxTranXs(isLocked)} />
                {isLocked ? <Box sx={sx.boxLockSx}>🔒</Box> : null}
              </Box>
            </Tooltip>
          </Box>

          <Box sx={{ width: '100%', alignSelf: 'center' }}>
            <Typography level="title-md" sx={{ textShadow: '0 1px 1px rgba(0,0,0,0.25)', fontWeight: 600, }}> {d.label} </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>
        </Box>


        <Box sx={sx.cardBodySx}>
          <PreviewDomainCardBody d={d} entity={entity} context={context} />
        </Box>
      </Sheet>

     <PreviewDomainCardOverlay
       d={d}
       open={open}
       entity={entity}
       setOpen={setOpen}
       context={context}
       fullName={fullName}
       onSaveInfo={onSaveInfo}
       playerPhoto={playerPhoto}
       videoActions={videoActions}
       restoreFocusRef={triggerRef}
       birthYearText={birthYearText}
       onClose={() => setOpen(false)}
     />

    </>
  )
}
