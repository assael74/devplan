// features/hub/scouting/desktop/ScoutView.js

import React, { useCallback, useEffect, useState } from 'react'
import { Box, Divider, Button, Tooltip, Sheet } from '@mui/joy'
import PhoneIphoneRounded from '@mui/icons-material/PhoneIphoneRounded'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import ScoutHeader from './ScoutHeader.js'
import { scoutViewSx } from './scoutView.sx.js'
import playerImage from '../../../../ui/core/images/playerImage.jpg'
import ifaImage from '../../../../ui/core/images/ifaImage.png'

import { useUpdateAction } from '../../../../ui/domains/entityActions/updateAction.js'
import EntityImageModal from '../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadEntityImageUrl as uploadImageOnly } from '../../application/index.js'

import EntityPositionsModal from '../../../../ui/patterns/modals/EntityPositionsModal.js'

import ScoutForm from './ScoutForm.js'
import ScoutPositionsButton from './ScoutPositionsButton.js'
import ScoutGamesSummaryBar from './ScoutGamesSummaryBar.js'
import ScoutGamesDialog from './ScoutGamesDialog.js'
import { scoutFormSx } from './scoutForm.sx.js'
import { useScoutDraft } from './scoutDraft.logic.js'

export default function ScoutView({ scout, locked, buildActions, context }) {
  const [posOpen, setPosOpen] = useState(false)
  const [gamesOpen, setGamesOpen] = useState(false)
  const scoutId = scout?.id || ''
  const scoutName = scout?.playerName || ''

  const { draft, setDraft, isDirty, buildPatch, resetDraft, commitBaseline, setBaseline } = useScoutDraft(scout)

  const [headerPhoto, setHeaderPhoto] = useState(scout?.photo || '')
  const [imgOpen, setImgOpen] = useState(false)

  useEffect(() => {
    setHeaderPhoto(scout?.photo || '')
  }, [scout?.photo])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'scouting',
    snackEntityType: 'scout',
    id: scoutId,
    entityName: scoutName,
    requireAnyUpdated: true,
  })

  const canSave = !!scoutId && isDirty && !pending && !locked

  const onSave = useCallback(async () => {
    if (!isDirty || pending) return
    const patch = buildPatch()
    if (!Object.keys(patch).length) return
    await runUpdate(patch, { section: 'scoutForm' })
    commitBaseline()
  }, [isDirty, pending, buildPatch, runUpdate, commitBaseline])

  const phone = draft.phone
  const ifaLink = draft?.ifaLink || null

  return (
    <>
      <Box sx={scoutViewSx.headerWrap({ type: 'scout', entity: scout })}>
        <Box sx={scoutFormSx.headerRow}>
          <ScoutHeader
            photo={headerPhoto || playerImage}
            title={draft.playerName || 'שחקן במעקב'}
            subtitle={draft.clubName || 'מועדון'}
            onOpenImage={() => setImgOpen(true)}
          />

          <Box sx={scoutFormSx.spacer} />

          <Box sx={scoutViewSx.actionsRow}>
            <Tooltip title={phone ? 'חיוג' : 'אין טלפון'}>
              <span>
                <Button
                  size="sm"
                  variant="soft"
                  disabled={!phone}
                  onClick={() => phone && window.open(`tel:${phone}`)}
                  startDecorator={<PhoneIphoneRounded />}
                >
                  חיוג
                </Button>
              </span>
            </Tooltip>

            <Tooltip title={ifaLink ? 'פתח באתר ההתאחדות' : 'אין קישור להתאחדות'}>
              <span>
                <Button
                  size="sm"
                  variant="soft"
                  disabled={!ifaLink}
                  sx={scoutFormSx.ifaBtn}
                  onClick={() => ifaLink && window.open(ifaLink, '_blank', 'noopener,noreferrer')}
                  startDecorator={
                    <Box
                      component="img"
                      src={ifaImage}
                      alt="התאחדות"
                      sx={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'contain' }}
                    />
                  }
                  endDecorator={<OpenInNewIcon />}
                >
                  התאחדות
                </Button>
              </span>
            </Tooltip>

          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={scoutFormSx.chipsRow}>
        <ScoutPositionsButton
          label="עמדות שחקן"
          value={draft.positions || scout.positions}
          disabled={locked || pending}
          onOpen={() => setPosOpen(true)}
        />

        <ScoutGamesSummaryBar
          gamesSummary={scout?.gamesSummary}
          games={scout?.games}
          disabled={pending}
          onOpenGames={() => setGamesOpen(true)}
        />
      </Box>

      <Sheet variant="outlined" sx={scoutFormSx.sheet}>
        <ScoutForm
          draft={draft}
          setDraft={setDraft}
          locked={locked}
          pending={pending}
          isDirty={isDirty}
          canSave={canSave}
          onReset={resetDraft}
          onSave={onSave}
        />
      </Sheet>

      <EntityImageModal
        open={imgOpen}
        onClose={() => setImgOpen(false)}
        entityType="scouting"
        id={scoutId}
        entityName={draft.playerName}
        currentPhotoUrl={headerPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          setHeaderPhoto(url)
          setDraft((d) => ({ ...d, photo: url }))
          setBaseline((b) => ({ ...b, photo: url }))
        }}
      />

      <EntityPositionsModal
        open={posOpen}
        entityType="scout"
        entity={{ ...scout, ...draft }}
        locked={locked}
        onClose={() => setPosOpen(false)}
        onAfterSave={(patch) => {
          setDraft((d) => ({ ...d, ...patch }))
          setBaseline((b) => ({ ...b, ...patch }))
        }}
      />

      <ScoutGamesDialog
        open={gamesOpen}
        onClose={() => setGamesOpen(false)}
        games={scout?.games}
      />
    </>
  )
}
