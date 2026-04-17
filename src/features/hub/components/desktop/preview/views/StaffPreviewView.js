// features/hub/components/desktop/preview/views/StaffPreviewView.js

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Divider, Button, Tooltip, Sheet } from '@mui/joy'
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import PhoneIphoneRounded from '@mui/icons-material/PhoneIphoneRounded'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import PreviewHeader from '../PreviewHeader'
import { previewSx } from './sx/contextView.sx'
import roleImage from '../../../../../../ui/core/images/roleImage.png'
import ifaImage from '../../../../../../ui/core/images/ifaImage.png'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'
import EntityImageModal from '../../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../../services/firestore/storage/uploadImageOnly.js'

import StaffPreviewForm from '../previewDomainCard/domains/roles/StaffPreviewForm.js'
import { staffPreviewSx } from '../previewDomainCard/domains/roles/staffPreview.sx.js'
import { useStaffPreviewDraft, useStaffRoleMeta } from '../previewDomainCard/domains/roles/staffPreview.logic.js'

const pickOptions = (context, keyAll, keyFallback) => Array.isArray(context[keyAll]) ? context[keyAll] : (context[keyFallback] || [])

export default function StaffPreviewView({ staff, locked, buildActions, context }) {
  const staffId = staff?.id || ''
  const staffName = staff?.fullName || ''

  const clubsOptions = useMemo(() => pickOptions(context, 'allClubs', 'clubs'), [context])
  const teamsOptions = useMemo(() => pickOptions(context, 'allTeams', 'teams'), [context])

  const { draft, setDraft, isDirty, buildPatch, resetDraft, commitBaseline, setBaseline } = useStaffPreviewDraft(staff)

  const [headerPhoto, setHeaderPhoto] = useState(staff?.photo || '')
  const [imgOpen, setImgOpen] = useState(false)

  useEffect(() => {
    setHeaderPhoto(staff?.photo || '')
  }, [staff?.photo])

  const meta = useStaffRoleMeta(draft?.type)

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'roles',
    snackEntityType: 'role',
    id: staffId,
    entityName: staffName,
    requireAnyUpdated: true,
  })

  const canSave = !!staffId && isDirty && !pending && !locked

  const onSave = useCallback(async () => {
    if (!isDirty || pending) return
    const patch = buildPatch()
    if (!Object.keys(patch).length) return
    await runUpdate(patch, { section: 'staffPreviewForm' })
    commitBaseline()
  }, [isDirty, pending, buildPatch, runUpdate, commitBaseline])

  const phone = draft.phone
  const email = draft.email
  const ifaLink = draft?.ifaLink || null

  return (
    <>
      <Box sx={previewSx.headerWrap({ type: 'role', entity: staff })}>
        <Box sx={staffPreviewSx.headerRow}>
          <PreviewHeader
            photo={headerPhoto || roleImage}
            title={draft.fullName || 'איש צוות'}
            idIcon={meta?.idIcon || ''}
            subtitle={meta?.labelH || ''}
            onOpenImage={() => setImgOpen(true)}
          />

          <Box sx={staffPreviewSx.spacer} />

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
                  sx={staffPreviewSx.ifaBtn}
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

      <Sheet variant="outlined" sx={staffPreviewSx.sheet}>
        <StaffPreviewForm
          draft={draft}
          setDraft={setDraft}
          clubsOptions={clubsOptions}
          teamsOptions={teamsOptions}
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
        entityType="roles"
        id={staffId}
        entityName={draft.fullName}
        currentPhotoUrl={headerPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          setHeaderPhoto(url)
          setDraft((d) => ({ ...d, photo: url }))
          setBaseline((b) => ({ ...b, photo: url }))
        }}
      />
    </>
  )
}
