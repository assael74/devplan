// features/hub/components/preview/views/PlayerPreviewView.js
import React, { useMemo, useState, useEffect } from 'react'
import { Box, Divider, Button, Chip, Tooltip, Typography } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import PreviewHeader from '../PreviewHeader'
import PreviewDomainsGrid from '../PreviewDomainsGrid'
import PreviewQuickActions from '../PreviewQuickActions'
import { TypeChip, KeyPlayerChip, LevelStars } from './parts/MetaChips.js'
import PreviewMetaChips from './components/PreviewMetaChips.js'
import JoyStarRating from '../../../../../ui/domains/ratings/JoyStarRating'
import QuickCreateMenu from '../../../../../ui/actions/QuickCreateMenu.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'

import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'
import { buildPreviewDomains } from './logic/buildPreviewDomains.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import ifaImage from '../../../../../ui/core/images/ifaImage.png'
import { iconUi } from '../../../../../ui/core/icons/iconUi'
import { previewSx } from './sx/contextView.sx'
import { playerPreviewViewSx as sx, getEntityNavBtnSx } from './sx/contextView.sx'

export default function PlayerPreviewView({
  player,
  routes,
  counts,
  stale,
  locked,
  buildActions,
  onOpenRoute,
  context,
}) {
  const [openImg, setOpenImg] = useState(false)
  const [headerPhoto, setHeaderPhoto] = useState(player?.photo || playerImage)

  useEffect(() => {
    setHeaderPhoto(player?.photo || playerImage)
  }, [player?.photo])

  // --- נתוני תצוגה ---
  const ui = player?.ui || {}
  const ifaLink = player?.ifaLink || null
  const isProject = String(player?.type || '') === 'project'

  const imageEntityType = player?.playerSource === 'private' ? 'privates' : 'players'
  const imageSnackType = 'player'

  const birthYear = player?.team?.teamYear || ''
  const subtitle = [
    player?.club?.clubName || '', player?.team?.teamName || player?.teamName || '', birthYear ? `שנתון ${birthYear}` : ''
  ].filter(Boolean).join(' · ')

  const domains = useMemo(() => {
    return buildPreviewDomains({
      entityType: 'player',
      entity: player,
      routes,
      counts,
      locked,
      stale,
      isProject,
    })
  }, [player, routes, counts, locked, stale, isProject])

  const actions = useMemo(() => {
    return typeof buildActions === 'function' ? buildActions({ type: 'player', entity: player }) : []
  }, [buildActions, player])

  return (
    <>
      <Box sx={previewSx.headerWrap({ type: 'player', entity: player })}>
        <Box sx={sx.headerRow}>
          <PreviewHeader
            photo={headerPhoto}
            title={`${player?.playerFullName || ''}`.trim() || 'שחקן'}
            subtitle={subtitle}
            onOpenImage={() => setOpenImg(true)}
          />

          <Box sx={{ flex: 1 }} />

          <Box sx={previewSx.actionsRow}>
            <Button
              size="sm"
              variant="soft"
              sx={getEntityNavBtnSx('player')}
              disabled={!routes?.full}
              onClick={() => routes?.full && onOpenRoute(routes.full)}
              endDecorator={<OpenInNewIcon />}
            >
              למסך שחקן
            </Button>

            <Tooltip title={ifaLink ? 'פתח באתר ההתאחדות' : 'אין קישור להתאחדות'}>
              <span>
                <Button
                  size="sm"
                  variant="soft"
                  disabled={!ifaLink}
                  onClick={() => ifaLink && window.open(ifaLink, '_blank', 'noopener,noreferrer')}
                  sx={sx.ifaBtn}
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

      <PreviewMetaChips
        entityType="player"
        entity={player}
        sx={previewSx}
      />

      {/* --- גריד קופסאות --- */}
      <PreviewDomainsGrid
        domains={domains}
        entity={player}
        isProject={isProject}
        context={context}
        videoActions={context?.videoActions}
        onSaveInfo={(patch) => console.log('save info patch', player?.id, patch)}
        onOpenDomain={(d) => d?.route && onOpenRoute?.(d.route, { domain: d.key })}
      />

      <PreviewQuickActions actions={actions} />

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType={imageEntityType}
        routerEntityType={imageEntityType}
        snackEntityType={imageSnackType}
        id={player?.id}
        entityName={`${player?.playerFirstName || ''} ${player?.playerLastName || ''}`.trim() || 'שחקן'}
        currentPhotoUrl={headerPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          setHeaderPhoto(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`)
        }}
      />
    </>
  )
}
