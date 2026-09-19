// features/playersDatabase/ui/pages/teamPage/roster/import/hooks/useRosterIdentityReview.js

import * as React from 'react'

import { readPlayerIdentityReview } from '../../../../../../services/read/index.js'

const EMPTY_IDENTITY_REVIEW = {
  open: false,
  rowIndex: -1,
  row: null,
  candidates: [],
  loading: false,
  error: '',
}

export default function useRosterIdentityReview({
  rows,
  setRows,
}) {
  const [identityReview, setIdentityReview] = React.useState(EMPTY_IDENTITY_REVIEW)

  const closeIdentityReview = React.useCallback(() => {
    setIdentityReview(EMPTY_IDENTITY_REVIEW)
  }, [])

  const openIdentityReview = React.useCallback(async rowIndex => {
    const row = rows[rowIndex]
    if (!row) return

    const candidates = Array.isArray(row.identityCandidates)
      ? row.identityCandidates
      : []

    setIdentityReview({
      open: true,
      rowIndex,
      row,
      candidates,
      loading: true,
      error: '',
    })

    try {
      const review = await readPlayerIdentityReview({
        candidates,
      })

      setIdentityReview(current => ({
        ...current,
        candidates: review.candidates,
        loading: false,
      }))
    } catch (error) {
      console.error('[playersDatabase/identity-review]', error)

      setIdentityReview(current => ({
        ...current,
        loading: false,
        error: error instanceof Error
          ? error.message
          : 'טעינת פרטי השחקן נכשלה',
      }))
    }
  }, [rows])

  const resolveIdentityReview = React.useCallback(({
    action,
    candidate = {},
  }) => {
    const rowIndex = identityReview.rowIndex
    if (rowIndex < 0) return

    setRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      if (action === 'useExisting') {
        const existingExternalPlayerId = String(
          candidate.externalPlayerId || ''
        ).trim()
        const incomingPlayerUrl = String(row.playerUrl || '').trim()
        const playerUrl = existingExternalPlayerId
          ? incomingPlayerUrl.replace(
            /([?&]player_id=)\d+/i,
            `$1${existingExternalPlayerId}`
          )
          : incomingPlayerUrl

        return {
          ...row,
          playerId: candidate.playerId || '',
          playerDocumentId: candidate.playerDocumentId || '',
          externalPlayerId: existingExternalPlayerId || row.externalPlayerId,
          playerUrl: playerUrl || candidate.playerUrl || '',
          identityResolution: 'useExisting',
          identityStatus: 'זוהה כשחקן קיים',
          identityMessage: existingExternalPlayerId
            ? `אושר כשחקן הקיים · מזהה ${existingExternalPlayerId}`
            : 'אושר כשחקן הקיים',
          identityValid: true,
        }
      }

      if (action === 'newPlayer') {
        return {
          ...row,
          playerId: '',
          playerDocumentId: '',
          identityResolution: 'ignoreConflict',
          identityStatus: 'אושר כשחקן חדש',
          identityMessage: 'אושר כשחקן אחר למרות התאמת השם',
          identityValid: true,
        }
      }

      if (action === 'incomingIdCorrect') {
        return {
          ...row,
          identityResolution: 'replaceExternalPending',
          identityStatus: 'דורש עדכון מזהה',
          identityMessage: 'סומן שזה אותו שחקן והמזהה החדש נכון; יש לעדכן את הזהות הקיימת לפני טעינת הסגל',
          identityValid: false,
        }
      }

      return row
    }))

    closeIdentityReview()
  }, [
    closeIdentityReview,
    identityReview.rowIndex,
    setRows,
  ])

  return {
    identityReview,
    openIdentityReview,
    closeIdentityReview,
    resolveIdentityReview,
  }
}
