// features/hub/components/preview/views/ClubContextView.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box, Divider, Button, Tooltip, IconButton } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import PreviewHeader from '../PreviewHeader'
import PreviewDomainsGrid from '../PreviewDomainsGrid'

import ClubEditDrawer from './components/clubDrawer/ClubEditDrawer.js'

import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'

import ifaImage from '../../../../../ui/core/images/ifaImage.png'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { useLifecycle } from '../../../../../ui/domains/entityLifecycle/LifecycleProvider.js'
import { previewSx, getEntityNavBtnSx, playerPreviewViewSx } from './sx/contextView.sx'
import { buildPreviewDomains } from './logic/buildPreviewDomains.js'

export default function ClubContextView({ club, routes, counts, onOpenRoute, context, }) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []
    return clubs.find((t) => t?.id === club?.id) || club || null
  }, [context?.clubs, club])

  const lifecycle = useLifecycle()

  const hasClub = !!club
  const entity = club || {}
  const c = counts || {}

  const [openImg, setOpenImg] = useState(false)
  const [headerPhoto, setHeaderPhoto] = useState('')
  const [editDrawer, setEditDrawer] = useState(false)

  const src = entity?.photo || buildFallbackAvatar({ entityType: 'club', id: entity?.id, name: entity?.clubName })

  useEffect(() => {
    setHeaderPhoto(src)
  }, [src])

  const ifaLink = entity?.ifaLink || null

  const domains = useMemo(() => {
    return buildPreviewDomains({
      entityType: 'club',
      entity,
      routes,
      counts: c,
    })
  }, [entity, routes, c])

  if (!hasClub) return null

  const isActive = !!entity?.active
  const tooltipText = isActive ? 'העבר לארכיון (ניתן לשחזור)' : 'שחזר מועדון מהארכיון'

  return (
    <>
      <Box sx={previewSx.headerWrap({ type: 'club', entity })}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <PreviewHeader
            photo={headerPhoto}
            title={entity?.clubName || 'מועדון'}
            subtitle={entity?.city || ''}
            onOpenImage={() => setOpenImg(true)}
          />

          <Box sx={{ flex: 1 }} />

          <Box sx={previewSx.actionsRow}>
            <Button
              size="sm"
              variant="outlined"
              sx={getEntityNavBtnSx('club')}
              disabled={!routes?.full}
              onClick={() => routes?.full && onOpenRoute(routes.full)}
              endDecorator={<OpenInNewIcon />}
            >
              למסך מועדון
            </Button>

            <Tooltip title={ifaLink ? 'פתח באתר ההתאחדות' : 'אין קישור להתאחדות'}>
              <span>
                <Button
                  size="sm"
                  variant="soft"
                  disabled={!ifaLink}
                  sx={playerPreviewViewSx.ifaBtn}
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

            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <Tooltip title="פעולות נוספות">
                <IconButton
                  size="sm"
                  variant="outlined"
                  onClick={() => setEditDrawer(true)}
                  sx={previewSx.moreBut('clubs')}
                >
                  {iconUi({ id: 'more' })}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <PreviewDomainsGrid
        domains={domains}
        entity={entity}
        context={context}
        onOpenDomain={(d) => d?.route && onOpenRoute?.(d.route, { domain: d.key })}
      />

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="clubs"
        id={entity?.id}
        entityName={entity?.clubName || 'מועדון'}
        currentPhotoUrl={entity?.photo || ''}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          setHeaderPhoto(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`)
        }}
      />

      <ClubEditDrawer
        open={editDrawer}
        club={liveClub}
        onClose={() => setEditDrawer(false)}
        onSaved={() => {}}
        context={{ ...context, clubId: liveClub?.id, club: liveClub }}
      />
    </>
  )
}
