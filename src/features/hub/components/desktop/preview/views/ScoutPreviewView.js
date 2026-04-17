// features/hub/components/desktop/preview/views/ScoutPreviewView.js

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Divider, Button, Tooltip, Sheet, Typography } from '@mui/joy'
import PhoneIphoneRounded from '@mui/icons-material/PhoneIphoneRounded'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import PreviewHeader from '../PreviewHeader'
import { previewSx } from './sx/contextView.sx'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import ifaImage from '../../../../../../ui/core/images/ifaImage.png'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'
import EntityImageModal from '../../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../../services/firestore/storage/uploadImageOnly.js'

import QuickCreateMenu from '../../../../../../ui/actions/QuickCreateMenu.js'
import EntityPositionsModal from '../../../../../../ui/patterns/modals/EntityPositionsModal.js'

import ScoutPreviewForm from '../previewDomainCard/domains/scouting/ScoutPreviewForm.js'
import ScoutPositionsButton from '../previewDomainCard/domains/scouting/ScoutPositionsButton.js'
import ScoutGamesSummaryBar from '../previewDomainCard/domains/scouting/ScoutGamesSummaryBar.js'
import ScoutGamesDialog from '../previewDomainCard/domains/scouting/ScoutGamesDialog.js'
import { scoutPreviewSx } from '../previewDomainCard/domains/scouting/scoutPreview.sx.js'
import { useScoutPreviewDraft, useScoutRoleMeta } from '../previewDomainCard/domains/scouting/scoutPreview.logic.js'

const pickOptions = (context, keyAll, keyFallback) =>
  Array.isArray(context[keyAll]) ? context[keyAll] : (context[keyFallback] || [])

export default function ScoutPreviewView({ scout, locked, buildActions, context }) {
  const [posOpen, setPosOpen] = useState(false)
  const [gamesOpen, setGamesOpen] = useState(false)
  const scoutId = scout?.id || ''
  const scoutName = scout?.playerName || ''

  const { draft, setDraft, isDirty, buildPatch, resetDraft, commitBaseline, setBaseline } = useScoutPreviewDraft(scout)

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
    await runUpdate(patch, { section: 'scoutPreviewForm' })
    commitBaseline()
  }, [isDirty, pending, buildPatch, runUpdate, commitBaseline])

  const phone = draft.phone
  const ifaLink = draft?.ifaLink || null

  return (
    <>
      <Box sx={previewSx.headerWrap({ type: 'scout', entity: scout })}>
        <Box sx={scoutPreviewSx.headerRow}>
          <PreviewHeader
            photo={headerPhoto || playerImage}
            title={draft.playerName || 'שחקן במעקב'}
            subtitle={draft.clubName || 'מועדון'}
            onOpenImage={() => setImgOpen(true)}
          />

          <Box sx={scoutPreviewSx.spacer} />

          <Box sx={previewSx.actionsRow}>
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
                  sx={scoutPreviewSx.ifaBtn}
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

      <Box sx={scoutPreviewSx.chipsRow}>
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

      <Sheet variant="outlined" sx={scoutPreviewSx.sheet}>
        <ScoutPreviewForm
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
