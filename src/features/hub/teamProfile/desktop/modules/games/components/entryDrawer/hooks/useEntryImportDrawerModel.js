// teamProfile/modules/games/components/entryDrawer/hooks/useEntryImportDrawerModel.js

import { useMemo, useState } from 'react'

import {
  buildEntryImportPreview,
} from '../../../../../../../editLogic/games/entryGames/index.js'

const SAMPLE_TEXT = `שם שחקן	בסגל	הרכב	דקות	שערים	בישולים
איתי כהן	כן	כן	80	1	0
יואב לוי	כן	לא	25	0	1
דניאל מזרחי	לא	לא
עומר לוי	כן	כן	80	0	0`

const buildPlayerOptions = rows => {
  return (rows || []).map(row => {
    const raw = row?.rawPlayer || {}

    return {
      ...raw,
      id: row.playerId,
      playerId: row.playerId,
      playerFullName: row.playerName,
      playerName: row.playerName,
      name: row.playerName,
      position: row.position,
      img: row.avatar,
      avatar: row.avatar,
      active: row.active,
    }
  })
}

const getDuplicatePlayerIds = rows => {
  const counts = rows.reduce((acc, row) => {
    if (!row?.valid || !row?.playerId) return acc

    acc[row.playerId] = (acc[row.playerId] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([playerId]) => playerId)
}

const resolveManualPreview = ({ preview, draft, manualMatches }) => {
  const draftRows = Array.isArray(draft?.rows) ? draft.rows : []

  const baseRows = (preview?.rows || []).map(row => {
    const manualPlayerId = manualMatches[row.importIndex]

    if (!manualPlayerId) return row

    const matchedRow = draftRows.find(item => item.playerId === manualPlayerId)
    if (!matchedRow) return row

    return {
      ...row,
      status: row.valid ? 'matched' : 'manual',
      valid: true,
      errors: [],
      matchBy: row.valid ? row.matchBy : 'manual',
      playerId: matchedRow.playerId,
      currentRow: matchedRow,
      resolvedPlayerName: matchedRow.playerName,
    }
  })

  const duplicatePlayerIds = getDuplicatePlayerIds(baseRows)

  const resolvedRows = baseRows.map(row => {
    if (!row.playerId || !duplicatePlayerIds.includes(row.playerId)) {
      return row
    }

    return {
      ...row,
      status: 'error',
      valid: false,
      errors: ['השחקן שויך יותר מפעם אחת'],
    }
  })

  const summary = resolvedRows.reduce(
    (acc, row) => {
      acc.total += 1

      if (row.valid) acc.matched += 1
      else acc.error += 1

      return acc
    },
    {
      total: 0,
      matched: 0,
      error: 0,
    }
  )

  return {
    ...preview,
    ok: summary.error === 0,
    message: summary.error ? 'יש שורות שדורשות תיקון' : 'השורות מוכנות להחלה',
    rows: resolvedRows,
    summary,
  }
}

export function useEntryImportDrawerModel({ draft, onApply, onClose } = {}) {
  const [text, setText] = useState('')
  const [manualMatches, setManualMatches] = useState({})

  const playerOptions = useMemo(() => {
    return buildPlayerOptions(draft?.rows || [])
  }, [draft])

  const preview = useMemo(() => {
    return buildEntryImportPreview({
      text,
      draft,
    })
  }, [text, draft])

  const resolvedPreview = useMemo(() => {
    return resolveManualPreview({
      preview,
      draft,
      manualMatches,
    })
  }, [preview, draft, manualMatches])

  const usedPlayerIds = useMemo(() => {
    return new Set(
      (resolvedPreview?.rows || [])
        .map(row => row.playerId)
        .filter(Boolean)
    )
  }, [resolvedPreview])

  const handleSetManualMatch = (importIndex, playerId) => {
    setManualMatches(prev => ({
      ...prev,
      [importIndex]: playerId,
    }))
  }

  const handleClear = () => {
    setText('')
    setManualMatches({})
  }

  const handleUseSample = () => {
    setText(SAMPLE_TEXT)
    setManualMatches({})
  }

  const handleTextChange = value => {
    setText(value)
    setManualMatches({})
  }

  const getRowPlayerOptions = row => {
    const selectValue = row.playerId || manualMatches[row.importIndex] || ''

    return playerOptions.map(option => {
      const optionId = option.id || option.playerId

      return {
        ...option,
        disabled: Boolean(
          optionId &&
          usedPlayerIds.has(optionId) &&
          optionId !== selectValue
        ),
      }
    })
  }

  const getRowSelectValue = row => {
    return row.playerId || manualMatches[row.importIndex] || ''
  }

  const handleApply = () => {
    if (!resolvedPreview?.ok) return

    onApply(resolvedPreview)
    onClose()
  }

  return {
    text,
    sampleText: SAMPLE_TEXT,
    resolvedPreview,

    handleTextChange,
    handleSetManualMatch,
    handleUseSample,
    handleClear,
    handleApply,

    getRowPlayerOptions,
    getRowSelectValue,
  }
}
