// src/features/playersDatabase/ui/pages/playerPage/PlayerScoutOverview.js

import * as React from 'react'
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageContentPanel from '../../components/page/PageContentPanel.js'
import ConfirmModal from '../../components/modals/ConfirmModal.js'
import RegularModal from '../../components/modals/RegularModal.js'
import { PlayerNarrativeContent } from '../../components/modals/PlayerNarrativeModal.js'
import { buildPlayerScoutView } from './logic/playerScoutView.js'
import PlayerScoutSummary from './scout/PlayerScoutSummary.js'
import PlayerSeasonNumbers from './scout/PlayerSeasonNumbers.js'
import PlayerScoutProfiles from './scout/PlayerScoutProfiles.js'
import PlayerScoutReasons from './scout/PlayerScoutReasons.js'
import PlayerScoutQuestions from './scout/PlayerScoutQuestions.js'
import { playerScoutOverviewSx as sx } from './sx/playerScoutOverview.sx.js'

function ApprovedNarrativeModal({
  open,
  narrativeView,
  loading,
  deleting,
  onClose,
  onUpdate,
  onRefine,
  onDelete,
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const approved = narrativeView?.approved
  const content = approved?.content || {}

  const handleDelete = async () => {
    if (!onDelete || deleting) return

    const deleted = await onDelete()
    if (!deleted) return

    setDeleteConfirmOpen(false)
    onClose()
  }

  return (
    <>
      <RegularModal
        open={open}
        title='סיפור שחקן'
        description='הסיפור המקצועי המאושר של השחקן.'
        iconId='profile'
        size='md'
        hideFooter
        contentSx={sx.storyModalContent}
        onClose={onClose}
      >
        <Box sx={sx.storyModalActions}>
          <Button
            size='sm'
            loading={loading}
            startDecorator={iconUi({id: 'trend', size: 'sm'})}
            onClick={onUpdate}
          >
            עדכן סיפור
          </Button>

          <Button
            size='sm'
            variant='soft'
            color='neutral'
            startDecorator={iconUi({id: 'edit', size: 'sm'})}
            disabled={loading || deleting}
            onClick={onRefine}
          >
            חידוד עם AI
          </Button>

          <Button
            size='sm'
            variant='plain'
            color='danger'
            startDecorator={iconUi({id: 'delete', size: 'sm'})}
            disabled={loading || deleting}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            מחק סיפור
          </Button>
        </Box>

        {approved ? (
          <PlayerNarrativeContent
            content={content}
            presentation={null}
          />
        ) : (
          <Typography level='body-md' sx={sx.emptyText}>
            אין כרגע תוכן סיפור מאושר להצגה.
          </Typography>
        )}
      </RegularModal>

      <ConfirmModal
        open={deleteConfirmOpen}
        title='מחיקת הסיפור המאושר'
        message='הפעולה תמחק רק את סיפור השחקן המאושר. נתוני הסקאוטינג, הפרופילים וההיסטוריה לא יימחקו.'
        iconId='delete'
        confirmLabel='מחק סיפור'
        confirmIconId='delete'
        cancelLabel='ביטול'
        busy={deleting}
        persistent
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteConfirmOpen(false)
        }}
      />
    </>
  )
}

function getProfileList(profiles = {}) {
  const list = []

  if (profiles.primary) {
    list.push(profiles.primary)
  }

  if (Array.isArray(profiles.supporting)) {
    profiles.supporting.forEach(profile => {
      if (profile) list.push(profile)
    })
  }

  if (profiles.near) {
    list.push(profiles.near)
  }

  return list
}

function getInitialProfileId(profiles = {}) {
  if (profiles.primary && profiles.primary.id) {
    return profiles.primary.id
  }

  if (
    Array.isArray(profiles.supporting)
    && profiles.supporting.length
    && profiles.supporting[0]
    && profiles.supporting[0].id
  ) {
    return profiles.supporting[0].id
  }

  if (profiles.near && profiles.near.id) {
    return profiles.near.id
  }

  return ''
}

function findSelectedProfile(profiles = {}, selectedProfileId = '') {
  const profileList = getProfileList(profiles)

  const selectedProfile = profileList.find(profile => (
    profile
    && profile.id
    && profile.id === selectedProfileId
  ))

  if (selectedProfile) {
    return selectedProfile
  }

  return profiles.primary || profileList[0] || null
}

export default function PlayerScoutOverview({
  player = {},
  historyRows = [],
  selectedRow = null,
  selectedContextId = '',
  contextOptions = [],
  narrativeView = {},
  narrativeLoading = false,
  narrativeDeleting = false,
  playerJsonLoading = false,
  reportLoading = false,
  onContextChange,
  onNarrativeGenerate,
  onNarrativeRefine,
  onNarrativeDelete,
  onPlayerJson,
  onTeamJson,
  teamJsonAvailable = false,
  onReport,
}) {
  const [storyOpen, setStoryOpen] = React.useState(false)
  const [downloadAnchor, setDownloadAnchor] = React.useState(null)

  const view = React.useMemo(() => buildPlayerScoutView({
    player,
    historyRows,
    selectedRow,
  }), [player, historyRows, selectedRow])

  const initialProfileId = React.useMemo(() => (
    getInitialProfileId(view.profiles)
  ), [view.profiles])

  const [selectedProfileId, setSelectedProfileId] = React.useState(
    initialProfileId,
  )

  React.useEffect(() => {
    const profileList = getProfileList(view.profiles)

    const selectedExists = profileList.some(profile => (
      profile
      && profile.id
      && profile.id === selectedProfileId
    ))

    if (selectedExists) return

    setSelectedProfileId(initialProfileId)
  }, [
    initialProfileId,
    selectedProfileId,
    view.profiles,
  ])

  const selectedProfile = React.useMemo(() => (
    findSelectedProfile(
      view.profiles,
      selectedProfileId,
    )
  ), [
    selectedProfileId,
    view.profiles,
  ])

  return (
    <>
      <PageContentPanel
        title='מצב סקאוטינג נוכחי'
        subtitle='החלטה מקצועית, סיפור, ראיות והקשר במקום אחד'
        headerActions={(
          <Box sx={sx.headerActions}>
            <Tooltip title='הצג והפק PDF'>
              <IconButton
                size='sm'
                variant='outlined'
                loading={reportLoading}
                sx={sx.headerIconButton}
                onClick={onReport}
              >
                {iconUi({id: 'print', size: 'sm'})}
              </IconButton>
            </Tooltip>

            <Tooltip title='הורדת נתונים'>
              <IconButton
                size='sm'
                variant='outlined'
                loading={playerJsonLoading}
                sx={sx.headerIconButton}
                onClick={event => setDownloadAnchor(event.currentTarget)}
              >
                {iconUi({id: 'download', size: 'sm'})}
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={downloadAnchor}
              open={Boolean(downloadAnchor)}
              placement='bottom-start'
              onClose={() => setDownloadAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setDownloadAnchor(null)
                  onPlayerJson()
                }}
              >
                {iconUi({id: 'playerDatabase', size: 'sm'})}
                מסמך שחקן
              </MenuItem>

              <MenuItem
                disabled={!teamJsonAvailable}
                onClick={() => {
                  setDownloadAnchor(null)
                  onTeamJson()
                }}
              >
                {iconUi({id: 'team', size: 'sm'})}
                מסמך קבוצה
              </MenuItem>
            </Menu>
          </Box>
        )}
        headerTone='soft'
        panelSx={sx.panel}
        contentSx={sx.content}
      >
        <PlayerScoutSummary
          view={view}
          narrativeView={narrativeView}
          loading={narrativeLoading}
          onStoryOpen={() => setStoryOpen(true)}
          onStoryGenerate={onNarrativeGenerate}
        />

        <Box sx={sx.seasonContextBar}>
          <Box sx={sx.seasonContextHeading}>
            <Box sx={sx.seasonContextIcon}>
              {iconUi({id: 'calendar', size: 'sm'})}
            </Box>

            <Typography level='title-md' sx={sx.seasonContextTitle}>
              הקשר עונתי
            </Typography>
          </Box>

          <Select
            size='sm'
            value={selectedContextId || ''}
            onChange={(_, value) => onContextChange(value || '')}
            sx={sx.contextSelect}
          >
            {contextOptions.map(option => (
              <Option key={option.id} value={option.id}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>

        <PlayerSeasonNumbers row={selectedRow || {}} />

        <Box sx={sx.seasonProfilesSection}>
          <PlayerScoutProfiles
            profiles={view.profiles}
            selectedProfileId={selectedProfileId}
            onSelect={setSelectedProfileId}
          />

          <PlayerScoutReasons
            key={selectedProfileId || 'primary-profile'}
            profile={selectedProfile}
          />
        </Box>

        <PlayerScoutQuestions questions={view.questions} />
      </PageContentPanel>

      <ApprovedNarrativeModal
        open={storyOpen}
        narrativeView={narrativeView}
        loading={narrativeLoading}
        deleting={narrativeDeleting}
        onClose={() => setStoryOpen(false)}
        onUpdate={() => {
          setStoryOpen(false)
          onNarrativeGenerate()
        }}
        onRefine={() => {
          setStoryOpen(false)
          onNarrativeRefine()
        }}
        onDelete={onNarrativeDelete}
      />
    </>
  )
}
