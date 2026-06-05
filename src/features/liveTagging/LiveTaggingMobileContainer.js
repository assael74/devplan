// src/features/liveTagging/LiveTaggingMobileContainer.js

import React from 'react'
import { Box, Button, Sheet, Typography } from '@mui/joy'

import {
  LiveClockBar,
  LiveObjectGameSelector,
} from './ui/toolbar/index.js'

import { LiveBaseActionsGrid } from './ui/actions/index.js'
import { LiveEventsSummary } from './ui/events/index.js'

import {
  LiveActionsSettingsDrawer,
  LiveTaggingFlowDrawer,
} from './ui/drawer/index.js'

import { modelSx as sx } from './model.sx.js'

export function LiveTaggingMobileContainer({ model }) {
  const showLoadDraft = model.hasCurrentDraft
  const showClear = model.hasCurrentDraft || model.hasEvents

  const handleClear = () => {
    if (model.handleClearLiveWork) {
      model.handleClearLiveWork()
      return
    }

    if (model.hasCurrentDraft) {
      model.handleDeleteDraft()
      return
    }

    model.handleCancelSession()
  }

  return (
    <Sheet sx={sx.mobile.root}>
      {model.error && (
        <Box sx={sx.mobile.messageBox('danger')}>
          <Typography level="body-sm" color="danger">
            שגיאה בטעינת הדאטה
          </Typography>
        </Box>
      )}

      {model.saveBlockedMessage && (
        <Box sx={sx.mobile.messageBox('warning')}>
          <Typography level="body-sm" color="warning">
            {model.saveBlockedMessage}
          </Typography>
        </Box>
      )}

      {model.visibleSaveError && (
        <Box sx={sx.mobile.messageBox('danger')}>
          <Typography level="body-sm" color="danger">
            {model.visibleSaveError}
          </Typography>
        </Box>
      )}

      {model.saveSuccessText && (
        <Box sx={sx.mobile.messageBox('success')}>
          <Typography level="body-sm" color="success">
            {model.saveSuccessText}
          </Typography>
        </Box>
      )}

      <LiveObjectGameSelector
        selection={model.selection}
        players={model.players}
        teams={model.teams}
        games={model.games}
        clubs={model.clubs}
        clubId={model.resolvedClubId}
        disabled={model.selectionDisabled}
        onSubjectTypeChange={model.handleSubjectTypeChange}
        onPlayerChange={model.handlePlayerChange}
        onTeamChange={model.handleTeamChange}
        onGameChange={model.handleGameChange}
      />

      <LiveClockBar
        model={model.headerModel}
        disabled={!model.ready}
        onToggle={model.handleToggleClock}
        onReset={model.handleResetClock}
        onSetTime={model.handleSetClockTime}
        onToggleSpeed={model.handleToggleSpeed}
      />

      <LiveBaseActionsGrid
        actions={model.visibleActions}
        disabled={!model.ready}
        selectedBaseActionId={model.selectedBaseActionId}
        onActionClick={model.handleBaseActionClick}
        onOpenSettings={model.handleOpenActionsSettings}
      />

      <LiveEventsSummary
        events={model.eventsModel}
        onDeleteLast={model.handleDeleteLastEvent}
      />

      <Box sx={sx.mobile.footer}>
        <Box sx={sx.mobile.footerSide('start')}>
          {showLoadDraft && (
            <Button
              size="sm"
              variant="soft"
              color="primary"
              disabled={model.pending}
              onClick={model.handleLoadDraft}
              sx={sx.mobile.footerButton}
            >
              טען
            </Button>
          )}

          {showClear && (
            <Button
              size="sm"
              variant="soft"
              color="danger"
              disabled={model.pending}
              onClick={handleClear}
              sx={sx.mobile.footerButton}
            >
              נקה
            </Button>
          )}
        </Box>

        <Box sx={sx.mobile.footerSide('end')}>
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            disabled={!model.ready || !model.hasEvents || model.pending}
            onClick={model.handleSaveDraft}
            sx={sx.mobile.footerButton}
          >
            טיוטה
          </Button>

          <Button
            size="sm"
            variant="solid"
            color="primary"
            disabled={!model.ready || !model.hasEvents || model.pending}
            onClick={model.handleFinishSession}
            sx={sx.mobile.footerMainButton}
          >
            {model.pending ? 'שומר...' : 'סיים'}
          </Button>
        </Box>
      </Box>

      <LiveTaggingFlowDrawer
        open={model.tagFlowOpen}
        step={model.tagFlowStep}
        baseAction={model.selectedBaseAction}
        selectedAction={model.selectedAction}
        selectedSide={model.tagState.selectedSide}
        onClose={model.handleCloseTaggingFlow}
        onQualityClick={model.handleQualityClick}
        onBackToQuality={model.handleBackToQuality}
        onZoneClick={model.handleZoneClick}
      />

      <LiveActionsSettingsDrawer
        open={model.actionsSettingsOpen}
        selectedActionPairIds={model.actionsState.selectedActionPairIds}
        onClose={model.handleCloseActionsSettings}
        onToggleAction={model.handleToggleActionPair}
        onResetActions={model.handleResetActionPairs}
      />
    </Sheet>
  )
}
