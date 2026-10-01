// src/features/playersDatabase/ui/pages/teamPage/roster/clear/useClearRosterFlow.js

import * as React from 'react'
import { prepareClearRoster } from '../../../../../services/writeV2/roster/clear/prepareClearRoster.js'
import { buildClearRosterApprovedState } from '../../../../../domain/rosterV2/clear/clearRosterApprovedState.builder.js'
import { writeClearRosterStep } from '../../../../../services/writeV2/roster/clear/writeClearRosterStep.js'
import { CLEAR_ROSTER_STEPS, startClearRosterSession, reportClearRosterCanonical, reportClearRosterStep, reportClearRosterFailure, finishClearRosterSession } from '../../../../../services/writeV2/roster/clear/clearRosterSession.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
export default function useClearRosterFlow({ team, selectedSeasonOption, leagueId, reload, refreshAfterStats }) {
  const birthTeamDocumentId = team?.birthTeamDocumentId || team?.teamDocumentId || team?.id || ''
  const buildTarget = React.useCallback(seasonOption => ({
    birthTeamDocumentId: clean(birthTeamDocumentId),
    seasonKey: clean(seasonOption?.seasonKey),
    leagueId: clean(seasonOption?.leagueId || leagueId),
  }), [birthTeamDocumentId, leagueId])
  const defaultTarget = React.useMemo(
    () => buildTarget(selectedSeasonOption),
    [buildTarget, selectedSeasonOption]
  )
  const [activeTarget, setActiveTarget] = React.useState(null)
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState('idle')
  const [proposal, setProposal] = React.useState(null)
  const [session, setSession] = React.useState(null)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [counts, setCounts] = React.useState({})
  const [message, setMessage] = React.useState('')
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
      setProposal(await prepareClearRoster(target))
      setStatus('preview')
    } catch (error) {
      setStatus('failed')
      setMessage(error.code === 'CLEAR_ROSTER_STATS_PRESENT'
        ? 'יש למחוק תחילה את הסטטיסטיקה.'
        : 'לא ניתן להכין את המחיקה. חסר מסמך נדרש או קיימת סתירה בנתוני הקבוצה. יש לבדוק את הנתונים לפני ניסיון נוסף.')
    } finally {
      busyRef.current = false
    }
  }

  const openModal = seasonOption => prepareTarget(
    seasonOption?.seasonKey ? buildTarget(seasonOption) : defaultTarget
  )

  const isDisabledFor = seasonOption => {
    return refreshAfterStats === 'executing' ||
      refreshAfterStats === 'loadingPreview' ||
      seasonOption?.deleteAction !== 'roster'
  }

  const getDeleteActionFor = seasonOption => {
    if (refreshAfterStats === 'executing' || refreshAfterStats === 'loadingPreview') return null
    return seasonOption?.deleteAction || null
  }

  const approve = async () => {
    if (busyRef.current || status !== 'preview') return
    busyRef.current = true
    setStatus('writing')
    try {
      const approvedState = buildClearRosterApprovedState(proposal)
      const receiptId = await startClearRosterSession(approvedState)
      setSession({ approvedState, receiptId })
      setStatus('steps')
    } catch (error) {
      setStatus('failed')
      setMessage('לא ניתן לפתוח או להמשיך את פעולת המחיקה. נתונים שנכתבו בניסיון קודם נשארים במקומם; יש לבדוק את הפעולה הפתוחה.')
    } finally {
      busyRef.current = false
    }
  }

  const next = async () => {
    if (busyRef.current || status !== 'steps' || !session) return
    busyRef.current = true
    setStatus('writing')
    const step = CLEAR_ROSTER_STEPS[stepIndex]
    try {
      if (step) {
        await writeClearRosterStep({
          approvedState: session.approvedState,
          step: step.id,
          onProgress: value => setCounts(previous => ({ ...previous, [step.id]: value })),
        })
        if (step.id === 'teamSeason') await reportClearRosterCanonical(session.receiptId, true)
        await reportClearRosterStep(session.receiptId, step.id)
        setStepIndex(index => index + 1)
        setStatus('steps')
      } else {
        const audit = await finishClearRosterSession(session)
        if (audit.result !== 'clean') {
          const error = new Error('Audit findings')
          const finding = audit.findings.find(item => item.documentId)
          error.failedTarget = finding
            ? { targetType: finding.target, documentId: finding.documentId }
            : null
          throw error
        }
        setStatus('succeeded')
        setMessage('הסגל נמחק והביקורת הושלמה בהצלחה.')
        try {
          await reload?.()
        } catch (reloadError) {
          setMessage('הסגל נמחק והביקורת הושלמה, אך רענון התצוגה נכשל. יש לרענן את העמוד.')
        }
      }
    } catch (error) {
      if (step?.id === 'teamSeason') {
        try { await reportClearRosterCanonical(session.receiptId, false) } catch (receiptError) { /* Receipt remains open. */ }
      }
      let receiptFailure = false
      try {
        await reportClearRosterFailure(session.receiptId, step?.id || 'audit', error)
      } catch (receiptError) {
        receiptFailure = true
      }
      setStatus('failed')
      setMessage(`הפעולה נעצרה בשלב ${step?.label || 'ביקורת הסנכרון'}. ניסיון נוסף דורש הכנה ואישור חדשים.${receiptFailure ? ' גם שמירת תיעוד הכשל נכשלה.' : ''}`)
    } finally {
      busyRef.current = false
    }
  }

  return {
    open, status, proposal, counts, message, stepIndex,
    target: activeTarget || defaultTarget,
    disabled: isDisabledFor(selectedSeasonOption),
    isDisabledFor,
    getDeleteActionFor,
    deleteActionsError: '',
    disabledReason: 'הפעולה נקבעת לפי מצב הסטטיסטיקה והסגל במסמך העונה.',
    openModal, retry: () => prepareTarget(activeTarget || defaultTarget), approve, next,
    close: () => {
      if (!busyRef.current && status !== 'steps') setOpen(false)
    },
  }
}
