// src/ui/forms/gameStatsForm/GameStatsCreateForm.js

import React, { useCallback } from 'react'

import GameStatsShell from './GameStatsShell.js'
import SaveConfirmModal from './modals/SaveConfirmModal.js'
import DeleteDraftConfirmModal from './modals/DeleteDraftConfirmModal.js'

import {
  buildGameStatsPayload,
  buildGameStatsSavePreview,
  createInitialGameStatsDraft,
  patchGameStatsDraft,
} from './logic/index.js'

const getGameId = ({ draft, game }) => {
  return draft?.gameId || game?.id || game?.gameId || ''
}

const saveButtonLabels = {
  draft: 'שמירת טיוטה',
  partial: 'שמירת סטטיסטיקה חלקית',
  committed: 'שמירת סטטיסטיקה מלאה',
}

const getSaveButtonLabel = draft => {
  return saveButtonLabels[draft?.status] || 'שמירת סטטיסטיקה'
}

const deleteConfirmModels = {
  localDraft: {
    title: 'מחיקת טיוטת סטטיסטיקה',
    text: 'פעולה זו תמחק את הטיוטה המקומית שנשמרה זמנית למשחק הזה.',
    warning: 'הנתונים שנשמרו ב־state יימחקו ולא ייטענו שוב בפתיחת הטופס.',
    confirmLabel: 'מחיקת טיוטה',
  },

  firestoreStats: {
    title: 'מחיקת טופס סטטיסטיקה רשמי',
    text: 'פעולה זו תמחק את מסמך הסטטיסטיקה הרשמי של המשחק ותבצע rollback לנתוני הקבוצה והשחקנים.',
    warning: 'המחיקה תסיר את הקישור מהמשחק, תמחק את מסמך הסטטיסטיקה, ותפחית את התרומה מה־teamsStats ומה־playersStats.',
    confirmLabel: 'מחיקת סטטיסטיקה רשמית',
  },
}

const buildDeleteConfirmModel = statsDeleteAction => {
  const base = deleteConfirmModels[statsDeleteAction?.type]
  if (!base) return null

  return {
    ...base,
    actionLabel: statsDeleteAction?.label || base.confirmLabel,
  }
}

export default function GameStatsCreateForm({
  open,
  game,
  team,
  context,
  onClose,
  onSave,
  savedDraft,
  onDeleteDraft,
  onDeleteStats,
  savePending = false,
  saveError = null,
  statsDeleteAction = null,
}) {
  const [activeStep, setActiveStep] = React.useState('players')
  const [draft, setDraft] = React.useState(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pendingSave, setPendingSave] = React.useState(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return

    setActiveStep('players')
    setConfirmOpen(false)
    setPendingSave(null)
    setDeleteOpen(false)

    if (savedDraft) {
      setDraft(savedDraft)
      return
    }

    setDraft(createInitialGameStatsDraft({ game, team }))
  }, [open, game, team, savedDraft])

  const handleDraft = useCallback(patch => {
    setDraft(prev => {
      return patchGameStatsDraft(prev, patch, { game, team })
    })
  }, [game, team])

  const handleSaveClick = () => {
    const payload = buildGameStatsPayload(draft)
    const preview = buildGameStatsSavePreview(payload)

    setPendingSave({
      payload,
      preview,
    })

    setConfirmOpen(true)
  }

  const handleConfirmClose = () => {
    if (savePending) return

    setConfirmOpen(false)
  }

  const handleConfirmSave = async () => {
    const payload = pendingSave?.payload
    if (!payload || savePending) return

    await onSave({
      payload,
      draft,
    })

    setConfirmOpen(false)
    setPendingSave(null)
  }

  const handleDeleteClick = () => {
    if (!statsDeleteAction?.type) return

    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    const gameId = getGameId({ draft, game })
    if (!gameId || !statsDeleteAction?.type || savePending) return

    if (statsDeleteAction.type === 'localDraft') {
      onDeleteDraft(gameId)
    }

    if (statsDeleteAction.type === 'firestoreStats') {
      await onDeleteStats({
        draft,
        game,
        statsDeleteAction,
      })
    }

    setDeleteOpen(false)
    setConfirmOpen(false)
    setPendingSave(null)
  }

  const saveButtonLabel = getSaveButtonLabel(draft)
  const deleteConfirmModel = buildDeleteConfirmModel(statsDeleteAction)

  return (
    <>
      <GameStatsShell
        open={open}
        game={game}
        team={team}
        draft={draft}
        savedDraft={savedDraft}
        activeStep={activeStep}
        onStep={setActiveStep}
        onDraft={handleDraft}
        onClose={onClose}
        onSave={handleSaveClick}
        saveButtonLabel={saveButtonLabel}
        statsDeleteAction={statsDeleteAction}
        onDeleteDraft={handleDeleteClick}
      />

      <SaveConfirmModal
        open={confirmOpen}
        preview={pendingSave?.preview}
        pending={savePending}
        error={saveError}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmSave}
      />

      <DeleteDraftConfirmModal
        open={deleteOpen}
        model={deleteConfirmModel}
        pending={savePending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
