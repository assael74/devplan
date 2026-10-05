// src/features/playersDatabase/ui/pages/teamPage/roster/clear/useClearRosterFlow.js

import * as React from 'react'
import { clearRoster, prepareRosterClear } from '../../../../../services/write/roster/index.js'
import { retryWriteActionReceipt } from '../../../../../services/write/recovery/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export default function useClearRosterFlow({ team, selectedSeasonOption, leagueId, refreshAfterStats }) {
  const teamId = clean(team?.teamId || team?.birthTeamDocumentId || team?.teamDocumentId || team?.id)
  const buildTarget = React.useCallback(seasonOption => ({
    teamId,
    seasonId: clean(seasonOption?.seasonId),
    seasonKey: clean(seasonOption?.seasonKey),
    leagueId: clean(seasonOption?.leagueId || leagueId),
  }), [leagueId, teamId])
  const defaultTarget = React.useMemo(() => buildTarget(selectedSeasonOption), [buildTarget, selectedSeasonOption])
  const [activeTarget, setActiveTarget] = React.useState(null)
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState('idle')
  const [proposal, setProposal] = React.useState(null)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [counts, setCounts] = React.useState({})
  const [message, setMessage] = React.useState('')
  const [receiptId, setReceiptId] = React.useState('')
  const busyRef = React.useRef(false)

  const prepareTarget = async requestedTarget => {
    if (busyRef.current) return
    const target = requestedTarget || activeTarget || defaultTarget
    busyRef.current = true
    setActiveTarget(target)
    setOpen(true)
    setStatus('preparing')
    setProposal(null)
    setStepIndex(0)
    setCounts({})
    setMessage('')
    try {
      const approvedState = await prepareRosterClear({ input: target })
      setProposal({
        approvedState,
        impact: {
          players: approvedState.impact?.players || 0,
          playerIndexes: approvedState.impact?.playerIndexes || 0,
          transfers: approvedState.impact?.transfers || 0,
        },
        identity: {
          teamId: approvedState.teamId,
          seasonId: approvedState.seasonId,
          leagueId: approvedState.leagueId,
          clubId: approvedState.clubId,
        },
      })
      setStatus('preview')
    } catch (error) {
      setStatus('failed')
      setMessage(
        error.code === 'ROSTER_CLEAR_STATS_PRESENT'
          ? 'יש למחוק תחילה את הסטטיסטיקה.'
          : error.code === 'ROSTER_CLEAR_MOVEMENT_PRESENT'
            ? 'לא ניתן למחוק סגל עם תנועות שחקנים פעילות.'
            : error?.message || 'לא ניתן להכין את מחיקת הסגל.'
      )
    } finally {
      busyRef.current = false
    }
  }

  const openModal = seasonOption => prepareTarget(seasonOption?.seasonId ? buildTarget(seasonOption) : defaultTarget)
  const isDisabledFor = seasonOption => refreshAfterStats === 'executing' || refreshAfterStats === 'loadingPreview' || seasonOption?.deleteAction !== 'roster'
  const getDeleteActionFor = seasonOption => refreshAfterStats === 'executing' || refreshAfterStats === 'loadingPreview' ? null : seasonOption?.deleteAction || null

  const approve = async () => {
    if (busyRef.current || status !== 'preview') return
    setStatus('steps')
    setStepIndex(0)
  }

  const next = async () => {
    if (busyRef.current || status !== 'steps' || !proposal?.approvedState) return
    busyRef.current = true
    setStatus('writing')
    try {
      const result = receiptId
        ? await retryWriteActionReceipt({
            receiptId,
            approvedState: proposal.approvedState,
          })
        : await clearRoster({
            approvedState: proposal.approvedState,
            display: {
              teamName: clean(team?.name || team?.displayName),
              seasonKey: clean((activeTarget || defaultTarget)?.seasonKey),
            },
          })
      setReceiptId(result.receiptId || '')
      setCounts({
        sync: {
          processed: Object.keys(result.stageResults || {}).length,
          total: Object.keys(result.stageResults || {}).length,
        },
      })
      if (result.status !== 'closed' || result.audit?.coverage?.complete !== true || (result.audit?.findings?.length || 0) > 0) {
        throw Object.assign(new Error('Roster Audit found differences'), { receiptId: result.receiptId })
      }
      setStepIndex(1)
      setStatus('succeeded')
      setMessage('הסגל נמחק והביקורת הושלמה בהצלחה.')
    } catch (error) {
      if (error?.receiptId) setReceiptId(error.receiptId)
      setStatus('failed')
      setMessage(error?.message || 'מחיקת הסגל נכשלה. ניסיון נוסף יבנה מצב מאושר חדש ממקורות טריים.')
    } finally {
      busyRef.current = false
    }
  }

  return {
    open,
    status,
    proposal,
    counts,
    message,
    stepIndex,
    target: activeTarget || defaultTarget,
    disabled: isDisabledFor(selectedSeasonOption),
    isDisabledFor,
    getDeleteActionFor,
    deleteActionsError: '',
    disabledReason: 'הפעולה נקבעת לפי מצב הסטטיסטיקה והסגל במסמך העונה.',
    openModal,
    retry: () => prepareTarget(activeTarget || defaultTarget),
    approve,
    next,
    close: () => {
      if (!busyRef.current && status !== 'steps') setOpen(false)
    },
  }
}
