// src/features/playersDatabase/ui/pages/playerPage/hooks/usePlayerNarrative.js

import * as React from 'react'

import {
  NARRATIVE_SCOPE,
  buildApprovedSnapshot,
  createNarrativeSession,
  setNarrativeDraft,
  resolveNarrativeView,
} from '../../../../domain/narrative/index.js'
import {
  generateNarrative,
  refineNarrative,
} from '../../../../services/narrative/index.js'
import { saveApprovedNarrative } from '../../../../services/write/players/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'

const clean = value => String(value || '').trim()

export default function usePlayerNarrative({ player, reload, notify }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [refining, setRefining] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [session, setSession] = React.useState(null)
  const [draftMeta, setDraftMeta] = React.useState(null)
  const view = React.useMemo(() => resolveNarrativeView({
    playerDomain: player?.domain || {},
  }), [player?.domain])

  const generate = React.useCallback(async () => {
    if (!player?.id || loading) return

    setLoading(true)

    try {
      const result = await generateNarrative({
        playerId: player.id,
      })
      const inputHash = result.meta?.inputHash || ''

      if (!result.draft || !inputHash) {
        throw new Error('Narrative backend returned an incomplete draft')
      }

      const nextSession = createNarrativeSession({
        scope: NARRATIVE_SCOPE.CAREER,
        inputHash,
      })

      setDraftMeta({
        ...result.meta,
        generatedAt: result.generatedAt,
        source: result.source,
        generator: result.generator,
      })
      setSession(setNarrativeDraft({
        session: nextSession,
        content: result.draft,
      }))
      setOpen(true)
    } catch (error) {
      console.error('Player narrative generation failed', error)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'יצירת הסיפור נכשלה',
        message: error?.message || 'שגיאה ביצירת סיפור השחקן',
      })
    } finally {
      setLoading(false)
    }
  }, [loading, notify, player?.id])

  const refine = React.useCallback(async instruction => {
    const safeInstruction = clean(instruction)
    if (!player?.id || !session?.draft || !safeInstruction || refining || saving) return false

    setRefining(true)

    try {
      const result = await refineNarrative({
        playerId: player.id,
        currentDraft: session.draft,
        instruction: safeInstruction,
      })

      if (!result.draft) {
        throw new Error('Narrative backend returned an incomplete refinement')
      }

      setDraftMeta(current => ({
        ...(current || {}),
        ...(result.meta || {}),
        generatedAt: result.generatedAt || current?.generatedAt || null,
        source: result.source || current?.source || 'ai',
        generator: result.generator || current?.generator || {},
      }))
      setSession(current => (
        current
          ? setNarrativeDraft({
              session: {
                ...current,
                inputHash: result.meta?.inputHash || current.inputHash,
              },
              content: result.draft,
              instruction: safeInstruction,
            })
          : current
      ))

      return true
    } catch (error) {
      console.error('Player narrative refinement failed', error)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'חידוד הסיפור נכשל',
        message: error?.message || 'שגיאה בחידוד סיפור השחקן',
      })

      return false
    } finally {
      setRefining(false)
    }
  }, [notify, player?.id, refining, saving, session?.draft])

  const approve = React.useCallback(async () => {
    if (!session?.draft || !draftMeta || saving || refining) return

    setSaving(true)

    try {
      const snapshot = buildApprovedSnapshot({
        session,
        meta: draftMeta,
        generatedAt: draftMeta.generatedAt || new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        source: draftMeta.source || 'ai',
        generator: draftMeta.generator || {},
      })

      await saveApprovedNarrative({
        playerDocumentId: player.id,
        careerSnapshot: snapshot,
      })

      setOpen(false)
      setSession(null)
      setDraftMeta(null)
      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'הסיפור נשמר',
        message: player.fullName || '',
      })
      reload()
    } catch (error) {
      console.error('Player narrative save failed', error)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'שמירת הסיפור נכשלה',
        message: error?.message || 'שגיאה בשמירת הסיפור',
      })
    } finally {
      setSaving(false)
    }
  }, [draftMeta, notify, player.fullName, player.id, refining, reload, saving, session])

  const close = React.useCallback(() => {
    if (saving || refining) return
    setOpen(false)
    setSession(null)
    setDraftMeta(null)
  }, [refining, saving])

  return {
    open,
    loading,
    refining,
    saving,
    session,
    view,
    presentation: draftMeta?.presentation || null,
    generate,
    refine,
    approve,
    close,
  }
}
