// src/features/playersDatabase/ui/pages/leaguePage/clear/useClearLeagueTeamsFlow.js

import * as React from 'react'

import { clearLeagueTeams } from '../../../../services/write/league/index.js'
import { getWriteActionReceipt } from '../../../../services/write/receipt/index.js'
import { repairWriteActionReceipt } from '../../../../services/write/recovery/index.js'
import {
  applyLeagueSyncProgressEvent,
  buildLeagueSyncStages,
} from '../logic/leagueSyncProgress.model.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const describe = error => clean(error && (error.message || error.code)) || 'לא ניתן להשלים את מחיקת קבוצות העונה.'

const getSeason = selectedSeasonOption => (
  selectedSeasonOption && selectedSeasonOption.season && typeof selectedSeasonOption.season === 'object'
    ? selectedSeasonOption.season
    : {}
)

const getTeamsCount = season => (
  season && season.table && season.table.teamsById && typeof season.table.teamsById === 'object'
    ? Object.keys(season.table.teamsById).length
    : 0
)

export default function useClearLeagueTeamsFlow({ league, selectedSeasonOption, reload }) {
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState('idle')
  const [proposal, setProposal] = React.useState(null)
  const [message, setMessage] = React.useState('')
  const [receiptId, setReceiptId] = React.useState('')
  const [executionReceipt, setExecutionReceipt] = React.useState(null)
  const [actionInput, setActionInput] = React.useState(null)
  const [result, setResult] = React.useState(null)
  const busy = React.useRef(false)

  const season = getSeason(selectedSeasonOption)
  const leagueId = clean(league && league.id)
  const seasonId = clean(selectedSeasonOption && selectedSeasonOption.seasonId)
  const seasonKey = clean(selectedSeasonOption && selectedSeasonOption.seasonKey)
  const tableState = clean(season && season.table && season.table.tableState)
  const alreadyCleared = tableState === 'NOT_LOADED'
  const disabled = !leagueId || !seasonId || alreadyCleared || ['writing'].includes(status)
  const disabledReason = !leagueId || !seasonId
    ? 'יש לבחור עונת ליגה תקינה.'
    : alreadyCleared
      ? 'קבוצות העונה כבר אינן טעונות.'
      : ''

  React.useEffect(() => {
    setOpen(false)
    setStatus('idle')
    setProposal(null)
    setMessage('')
    setReceiptId('')
    setExecutionReceipt(null)
    setActionInput(null)
    setResult(null)
  }, [leagueId, seasonId])

  const openModal = React.useCallback(() => {
    if (disabled || busy.current) return
    const nextInput = {
      leagueId,
      seasonId,
      updatedAt: new Date().toISOString(),
    }
    setActionInput(nextInput)
    setProposal({
      identity: { leagueId, seasonId, seasonKey },
      impact: {
        teams: getTeamsCount(season),
      },
    })
    setMessage('')
    setExecutionReceipt(null)
    setStatus('preview')
    setOpen(true)
  }, [disabled, leagueId, season, seasonId, seasonKey])

  const execute = React.useCallback(async () => {
    if (busy.current || !actionInput) return false
    if (receiptId && !executionReceipt) {
      setMessage('לא ניתן לקבוע את מצב הקבלה. יש לפתוח אותה בעמוד ניהול הדאטה.')
      return false
    }
    busy.current = true
    setStatus('writing')
    setMessage('')

    try {
      const canonicalConfirmed = clean(
        executionReceipt && executionReceipt.canonicalOutcome
      ) === 'confirmed'
      if (canonicalConfirmed) {
        setExecutionReceipt(current => applyLeagueSyncProgressEvent({
          receipt: current,
          event: { type: 'repairStarted', receiptId },
        }))
      }
      const nextResult = canonicalConfirmed
        ? await repairWriteActionReceipt({ receiptId })
        : await clearLeagueTeams({
            input: actionInput,
            receiptId,
            display: {
              leagueName: clean(league && league.name),
              seasonKey,
              birthYear: season && season.birthYear ? season.birthYear : null,
            },
            onProgress: event => {
              setReceiptId(clean(event && event.receiptId))
              setExecutionReceipt(current => applyLeagueSyncProgressEvent({
                receipt: current,
                event,
              }))
            },
          })
      setResult(nextResult)
      setReceiptId(clean(nextResult && nextResult.receiptId))
      try {
        const completedReceipt = await getWriteActionReceipt({
          receiptId: clean(nextResult && nextResult.receiptId),
        })
        setExecutionReceipt(completedReceipt)
      } catch {
        setExecutionReceipt(current => ({
          ...current,
          id: clean(nextResult && nextResult.receiptId),
          status: nextResult && nextResult.status,
          executionStatus: nextResult && nextResult.executionStatus,
          recoveryRequired: Boolean(nextResult && nextResult.recoveryRequired),
        }))
      }

      if (nextResult && nextResult.status === 'closed' && nextResult.executionStatus === 'succeeded') {
        setStatus('succeeded')
        setMessage('קבוצות העונה נמחקו וה־Audit הושלם בהצלחה.')
        try {
          if (typeof reload === 'function') await reload()
        } catch (error) {
          setMessage('המחיקה וה־Audit הושלמו, אך רענון התצוגה נכשל. יש לרענן את העמוד.')
        }
        return true
      }

      setStatus('failed')
      setMessage('הפעולה הסתיימה עם Audit שאינו נקי. ניתן לנסות שוב עם אותו Receipt.')
      return false
    } catch (error) {
      const failedReceiptId = clean(error && error.receiptId) || receiptId
      if (failedReceiptId) {
        setReceiptId(failedReceiptId)
        try {
          const failedReceipt = await getWriteActionReceipt({ receiptId: failedReceiptId })
          setExecutionReceipt(failedReceipt)
        } catch {
          setExecutionReceipt(null)
        }
      }
      setStatus('failed')
      setMessage(describe(error))
      return false
    } finally {
      busy.current = false
    }
  }, [actionInput, executionReceipt, league, receiptId, reload, season, seasonKey])

  return {
    open,
    status,
    proposal,
    message,
    receiptId,
    result,
    executionReceipt,
    syncStages: buildLeagueSyncStages({ receipt: executionReceipt, busy: status === 'writing' }),
    retryMode: clean(executionReceipt && executionReceipt.canonicalOutcome) === 'confirmed'
      ? 'repair'
      : 'retry',
    busy: status === 'writing',
    disabled,
    disabledReason,
    nextDeleteAction: '',
    nextDeleteTargetId: '',
    alreadyCleared,
    openModal,
    approve: execute,
    retry: execute,
    recheck: async () => {
      if (typeof reload === 'function') await reload()
    },
    close: () => {
      if (busy.current) return
      setOpen(false)
    },
  }
}
