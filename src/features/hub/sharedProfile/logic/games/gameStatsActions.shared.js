// src/features/hub/sharedProfile/logic/games/gameStatsActions.shared.js

function getLocalDraft({ gameId, statsPayloadsByGameId }) {
  if (!gameId || !statsPayloadsByGameId) return null

  return statsPayloadsByGameId[gameId] || null
}

export function getStatsSavePayload(saveModel) {
  if (!saveModel) return null

  return saveModel.payload || null
}

export function getStatsSaveDraft(saveModel) {
  if (!saveModel) return null

  return saveModel.draft || null
}

export function resolveStatsDocumentId({
  game,
  draft,
  activeDraft,
  getGameStatsDocId,
}) {
  const fromGame = getGameStatsDocId(game)

  if (fromGame) return fromGame

  const draftDocId = draft && (
    draft.gameStatsDocId ||
    draft.statsDocId
  )

  if (draftDocId) return draftDocId

  const activeDraftDocId = activeDraft && (
    activeDraft.gameStatsDocId ||
    activeDraft.statsDocId
  )

  return activeDraftDocId || ''
}

export function buildProfileStatsDeleteAction({
  editingStatsGame,
  activeStatsFormDraft,
  statsPayloadsByGameId,
  getGameId,
  getGameStatsDocId,
  isLocalDraftSave,
}) {
  const gameId = getGameId(editingStatsGame)
  const localDraft = getLocalDraft({ gameId, statsPayloadsByGameId })

  if (isLocalDraftSave(localDraft)) {
    return {
      type: 'localDraft',
      label: 'מחיקת טיוטה',
      color: 'danger',
      disabled: false,
    }
  }

  const firestoreDocId = resolveStatsDocumentId({
    game: editingStatsGame,
    activeDraft: activeStatsFormDraft,
    getGameStatsDocId,
  })

  if (firestoreDocId) {
    return {
      type: 'firestoreStats',
      label: 'מחיקת טופס סטטיסטיקה',
      color: 'danger',
      disabled: false,
    }
  }

  return null
}

export async function saveProfileGameStats({
  saveModel,
  isLocalDraftSave,
  saveStatsDraft,
  saveStatsToFirestore,
  getCreatedStatsDocId,
  mergeStatsDocId,
  completeStatsFirestoreSave,
}) {
  const payload = getStatsSavePayload(saveModel)
  const draft = getStatsSaveDraft(saveModel)

  if (!payload) return false

  if (isLocalDraftSave(payload)) {
    saveStatsDraft({ payload, draft })
    return true
  }

  const result = await saveStatsToFirestore(payload)
  const gameStatsDocId = getCreatedStatsDocId({ result, payload })

  completeStatsFirestoreSave(
    mergeStatsDocId({ payload, draft, gameStatsDocId })
  )

  return true
}
