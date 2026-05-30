// src/ui/forms/gameStatsForm/GameStatsShell.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Sheet,
  Typography,
} from '@mui/joy'

import GameStatsMetaPanel from './GameStatsMetaPanel.js'
import { renderGameStatsStep } from './steps/GameStatsSteps.js'

import { formSx as sx } from './sx/form.sx.js'
import { iconUi } from '../../core/icons/iconUi.js'

import {
  GAME_STATS_FORM_STEPS,
  getGameTitle,
} from './logic/index.js'

const statusLabels = {
  draft: 'טיוטה',
  partial: 'חלקי',
  committed: 'מלא',
}

const getStatusLabel = status => {
  return statusLabels[status] || status || 'טיוטה'
}

function Header({
  game,
  team,
  draft,
  onClose,
  onSave,
  onDeleteDraft,
  saveButtonLabel,
  statsDeleteAction = null,
}) {
  return (
    <Box sx={sx.header}>
      <Box sx={sx.headerMain}>
        <Box sx={sx.headerIcon}>
          {iconUi({ id: 'addStats' })}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography level="body-xs" sx={sx.kicker}>
            סטטיסטיקה מתקדמת
          </Typography>

          <Typography level="title-md" sx={sx.title}>
            {team?.name || 'קבוצה'} · {getGameTitle(game)}
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.headerActions}>
        {statsDeleteAction ? (
          <Button
            size="sm"
            variant="soft"
            color={statsDeleteAction.color || 'danger'}
            disabled={statsDeleteAction.disabled}
            startDecorator={iconUi({ id: 'delete' })}
            onClick={onDeleteDraft}
            sx={{ border: '1px solid', borderColor: 'divider'}}
          >
            {statsDeleteAction.label}
          </Button>
        ) : null}

        <Chip size="sm" variant="soft" color="warning">
          {getStatusLabel(draft?.status)}
        </Chip>

        <Button
          size="sm"
          variant="solid"
          color="success"
          startDecorator={iconUi({ id: 'save' })}
          onClick={onSave}
        >
          {saveButtonLabel}
        </Button>

        <IconButton size="sm" variant="soft" color="neutral" onClick={onClose}>
          {iconUi({ id: 'close' })}
        </IconButton>
      </Box>
    </Box>
  )
}

function StepsBar({ activeStep, onStep }) {
  return (
    <Box sx={sx.stepsBar}>
      {GAME_STATS_FORM_STEPS.map(step => (
        <Button
          key={step.id}
          size="sm"
          variant={activeStep === step.id ? 'solid' : 'soft'}
          color={activeStep === step.id ? 'primary' : 'neutral'}
          onClick={() => onStep(step.id)}
          sx={sx.stepButton}
        >
          {step.label}
        </Button>
      ))}
    </Box>
  )
}

export default function GameStatsShell({
  open,
  game,
  team,
  draft,
  savedDraft,
  activeStep,
  onStep,
  onDraft,
  onClose,
  onSave,
  statsDeleteAction = null,
  onDeleteDraft,
  saveButtonLabel = 'שמירת סטטיסטיקה',
}) {
  return (
    <Drawer
      open={!!open}
      anchor="bottom"
      onClose={onClose}
      slotProps={{
        content: {
          sx: sx.drawerContent,
        },
      }}
    >
      <Sheet variant="plain" sx={sx.drawerSheet}>
        <Header
          game={game}
          team={team}
          draft={draft}
          onClose={onClose}
          onSave={onSave}
          onDeleteDraft={onDeleteDraft}
          saveButtonLabel={saveButtonLabel}
          statsDeleteAction={statsDeleteAction}
        />

        <Divider />

        <Box sx={sx.body}>
          <Box sx={sx.side}>
            <StepsBar activeStep={activeStep} onStep={onStep} />
            <GameStatsMetaPanel draft={draft} onDraft={onDraft} />
          </Box>

          <Box sx={sx.main} className="dpScrollThin">
            {renderGameStatsStep({
              activeStep,
              draft,
              savedDraft,
              onDraft,
              onStep,
            })}
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
