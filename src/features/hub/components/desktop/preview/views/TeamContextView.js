// features/hub/components/desktop/preview/views/TeamContextView.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box, Divider, Button, Tooltip, Typography, IconButton } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import PreviewHeader from '../PreviewHeader'
import PreviewDomainsGrid from '../PreviewDomainsGrid'
import EntityImageModal from '../../../../../../ui/domains/entityImage/EntityImageModal.js'
import JoyStarRating from '../../../../../../ui/domains/ratings/JoyStarRating'

import TeamEditDrawer from './components/teamDrawer/TeamEditDrawer.js'
import PreviewMetaChips from './components/PreviewMetaChips.js'
import { LevelStars } from './parts/MetaChips.js'

import ifaImage from '../../../../../../ui/core/images/ifaImage.png'
import { resolveEntityAvatar } from '../../../../../../ui/core/avatars/fallbackAvatar.js'
import { uploadImageOnly } from '../../../../../../services/firestore/storage/uploadImageOnly.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'
import { useLifecycle } from '../../../../../../ui/domains/entityLifecycle/LifecycleProvider.js'
import { previewSx, getEntityNavBtnSx, playerPreviewViewSx } from './sx/contextView.sx'
import { buildPreviewDomains } from './logic/buildPreviewDomains.js'
import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

export default function TeamContextView({ team, routes, counts, onOpenRoute, context }) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === team?.id) || team || null
  }, [context?.teams, team])

  const lifecycle = useLifecycle()

  const hasTeam = !!team
  const t = team || {}
  const c = counts || {}

  const [openImg, setOpenImg] = useState(false)
  const [headerPhoto, setHeaderPhoto] = useState('')
  const [editDrawer, setEditDrawer] = useState(false)

  const src = resolveEntityAvatar({
    entityType: 'team',
    team,
    parentEntity: team?.club,
    subline: team?.club?.name,
  })

  useEffect(() => {
    setHeaderPhoto(src)
  }, [src])

  const ifaLink = t?.ifaLink || null

  const domains = useMemo(() => {
    return buildPreviewDomains({
      entityType: 'team',
      entity: t,
      routes,
      counts: c,
    })
  }, [t, routes, c])

  if (!hasTeam) return null

  const isActive = !!t?.active
  const tooltipText = isActive ? 'העבר לארכיון (ניתן לשחזור)' : 'שחזר מועדון מהארכיון'

  return (
    <>
      <Box sx={previewSx.headerWrap({ type: 'team', entity: t })}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <PreviewHeader
            photo={headerPhoto}
            onOpenImage={() => setOpenImg(true)}
            title={t?.teamName || 'קבוצה'}
            subtitle={t?.teamYear ? `שנתון ${t.teamYear}` : ''}
          />

          <Box sx={{ flex: 1 }} />

          <Box sx={previewSx.actionsRow}>
            <Button
              size="sm"
              variant="outlined"
              sx={getEntityNavBtnSx('team')}
              disabled={!routes?.full}
              onClick={() => routes?.full && onOpenRoute(routes.full)}
              endDecorator={<OpenInNewIcon />}
            >
              למסך קבוצה
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
                  sx={previewSx.moreBut('teams')}
                >
                  {iconUi({ id: 'more' })}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <PreviewMetaChips
        entityType="team"
        entity={t}
        sx={previewSx}
      />

      <PreviewDomainsGrid
        domains={domains}
        entity={t}
        context={context}
        videoActions={context?.videoActions}
        onSaveInfo={(patch) => console.log('save info patch', t?.id, patch)}
        onOpenDomain={(d) => d?.route && onOpenRoute?.(d.route, { domain: d.key })}
      />

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="teams"
        id={t?.teamId || t?.id}
        entityName={t?.teamName || 'קבוצה'}
        currentPhotoUrl={t?.photo || ''}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          setHeaderPhoto(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`)
        }}
      />

      <TeamEditDrawer
        open={editDrawer}
        team={liveTeam}
        onClose={() => setEditDrawer(false)}
        onSaved={() => {}}
        context={{ ...context, teamId: liveTeam?.id, team: liveTeam }}
      />
    </>
  )
}
