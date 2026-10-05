// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/useDeleteLeagueSeason.js

import * as React from 'react'

import { deleteLeagueSeason } from '../../../../services/write/league/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const describe = error => clean(error && (error.message || error.code)) || 'לא ניתן להשלים את מחיקת עונת הליגה.'

export default function useDeleteLeagueSeason({ reload }) {
  const [selected, setSelected] = React.useState(null)
  const [status, setStatus] = React.useState('idle')
  const [proposal, setProposal] = React.useState(null)
  const [message, setMessage] = React.useState('')
  const [receiptId, setReceiptId] = React.useState('')
  const [actionInput, setActionInput] = React.useState(null)
  const [result, setResult] = React.useState(null)
  const busy = React.useRef(false)

  const availability = React.useCallback(row => {
    if (!row || !clean(row.leagueId) || !clean(row.seasonId) || !row.hasSelectedSeason) {
      return { allowed: false, reason: 'מחיקת עונה זמינה רק לעונה קנונית קיימת.' }
    }
    if (busy.current || status === 'writing') {
      return { allowed: false, reason: 'פעולת League אחרת בביצוע.' }
    }
    if (clean(row.tableStatus) !== 'missing') {
      return { allowed: false, reason: 'יש לבצע מחיקת קבוצות העונה לפני מחיקת העונה.' }
    }
    return { allowed: true, label: 'מחיקת עונה', reason: '' }
  }, [status])

  const open = React.useCallback(row => {
    const state = availability(row)
    if (!state.allowed) return

    const input = {
      leagueId: clean(row.leagueId),
      seasonId: clean(row.seasonId),
      updatedAt: new Date().toISOString(),
    }
    setSelected(row)
    setActionInput(input)
    setReceiptId('')
    setResult(null)
    setMessage('')
    setProposal({
      identity: {
        leagueId: input.leagueId,
        seasonId: input.seasonId,
        seasonKey: clean(row.seasonKey),
      },
      impact: {
        teams: Number(row.teamsCount || 0),
      },
    })
    setStatus('preview')
  }, [availability])

  const execute = React.useCallback(async () => {
    if (busy.current || !selected || !actionInput) return false
    busy.current = true
    setStatus('writing')
    setMessage('')

    try {
      const nextResult = await deleteLeagueSeason({
        input: actionInput,
        receiptId,
        display: {
          leagueName: clean(selected.leagueName),
          seasonKey: clean(selected.seasonKey),
          birthYear: selected.birthYear || null,
        },
      })
      setResult(nextResult)
      setReceiptId(clean(nextResult && nextResult.receiptId))

      if (nextResult && nextResult.status === 'closed' && nextResult.executionStatus === 'succeeded') {
        setStatus('succeeded')
        setMessage('עונת הליגה נמחקה וה־Audit הושלם בהצלחה.')
        try {
          if (typeof reload === 'function') await reload(selected)
        } catch (error) {
          setMessage('המחיקה וה־Audit הושלמו, אך רענון הנתונים נכשל. יש לרענן את העמוד.')
        }
        return true
      }

      setStatus('failed')
      setMessage('הפעולה הסתיימה עם Audit שאינו נקי. ניתן לנסות שוב עם אותו Receipt.')
      return false
    } catch (error) {
      if (clean(error && error.receiptId)) setReceiptId(clean(error.receiptId))
      setStatus('failed')
      setMessage(describe(error))
      return false
    } finally {
      busy.current = false
    }
  }, [actionInput, receiptId, reload, selected])

  return {
    selected,
    status,
    proposal,
    message,
    receiptId,
    result,
    availability,
    open,
    approve: execute,
    retry: execute,
    close: () => {
      if (busy.current) return
      setSelected(null)
      setStatus('idle')
      setProposal(null)
      setMessage('')
    },
  }
}
