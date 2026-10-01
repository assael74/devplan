// src/features/playersDatabase/ui/pages/leaguePage/clear/useClearLeagueTeamsFlow.js

import * as React from 'react'
import { prepareClearLeagueTeams } from '../../../../services/writeV2/league/clear/prepareClearLeagueTeams.js'
import { buildClearLeagueTeamsApprovedState } from '../../../../domain/leagueV2/clear/clearLeagueTeamsApprovedState.builder.js'
import { CLEAR_LEAGUE_STEPS } from '../../../../domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js'
import { writeClearLeagueTeamsStep } from '../../../../services/writeV2/league/clear/writeClearLeagueTeamsStep.js'
import {
  startClearLeagueTeamsSession, reportClearLeagueStep, reportClearLeagueFailure, finishClearLeagueTeamsSession,
} from '../../../../services/writeV2/league/clear/clearLeagueTeamsSession.js'

const messages = {
  CLEAR_LEAGUE_ORPHAN_ROOT: 'נמצאה הפניית קבוצה לעונה חסרה או שגויה. נדרשת בדיקת הנתונים לפני המחיקה.',
  CLEAR_LEAGUE_DEPENDENCIES: 'יש להשלים מחיקת סטטיסטיקה וסגל בקבוצות העונה, כולל העברות ושאריות סקאוטינג.',
  CLEAR_LEAGUE_STATS_PRESENT: 'נמצאו נתוני סטטיסטיקה או שאריות סקאוטינג. יש למחוק תחילה את הסטטיסטיקה בקבוצה המסומנת.',
  CLEAR_LEAGUE_ROSTER_PRESENT: 'הסטטיסטיקה נקייה, אך עדיין קיים סגל או מידע תנועתי. יש למחוק את הסגל בקבוצה המסומנת.',
  CLEAR_LEAGUE_PLAYER_INDEX: 'נותרו אינדקסי שחקנים. יש להשלים מחיקת סגל וביקורת סגל לפני מחיקת קבוצות הליגה.',
  CLEAR_LEAGUE_FORECAST_AMBIGUOUS: 'לא ניתן לזהות לאיזו עונה שייכת תחזית. נדרשת בדיקת הנתונים לפני המחיקה.',
  CLEAR_LEAGUE_CHANGED: 'הנתונים השתנו מאז ההכנה. יש להכין ולאשר מחדש.',
}
const describe = error => messages[error?.code] || 'לא ניתן להשלים את הפעולה. יש לבדוק את זהויות העונה ואת המסמכים הנדרשים.'

export default function useClearLeagueTeamsFlow({ league, selectedSeasonOption, reload }) {
  const leagueId = league?.id || league?.leagueId || ''
  const seasonKey = selectedSeasonOption?.seasonKey || ''
  const target = React.useMemo(() => ({ leagueId, seasonKey }), [leagueId, seasonKey])
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState('idle')
  const [proposal, setProposal] = React.useState(null)
  const [session, setSession] = React.useState(null)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [counts, setCounts] = React.useState({})
  const [message, setMessage] = React.useState('')
  const [eligibility, setEligibility] = React.useState(null)
  const busy = React.useRef(false)
  const checkEligibility = React.useCallback(async () => {
    if (!leagueId || !seasonKey) return { allowed: false, reason: 'יש לבחור עונת ליגה.' }
    try {
      const prepared = await prepareClearLeagueTeams(target)
      if (prepared.state === 'absent') {
        return {
          allowed: false,
          reason: 'קבוצות העונה כבר נמחקו.',
          alreadyCleared: true,
        }
      }
      return { allowed: true, reason: '' }
    } catch (error) {
      return {
        allowed: false,
        reason: describe(error),
        nextAction: error?.details?.nextAction || '',
        nextTargetId: error?.details?.birthTeamDocumentId || '',
      }
    }
  }, [target, leagueId, seasonKey])

  React.useEffect(() => {
    setEligibility(null)
  }, [leagueId, seasonKey])

  const prepare = async () => {
    if (busy.current) return
    busy.current = true
    setOpen(true)
    setStatus('preparing')
    setMessage('')
    setProposal(null)
    setCounts({})
    setStepIndex(0)
    try {
      const prepared = await prepareClearLeagueTeams(target)
      if (prepared.state === 'absent') {
        setEligibility({
          allowed: false,
          reason: 'קבוצות העונה כבר נמחקו.',
          alreadyCleared: true,
        })
        setStatus('succeeded')
        setMessage('קבוצות העונה כבר נמחקו.')
        return
      }
      setEligibility({ allowed: true, reason: '' })
      setProposal(prepared)
      setStatus('preview')
    } catch (error) {
      setEligibility({
        allowed: false,
        reason: describe(error),
        nextAction: error?.details?.nextAction || '',
        nextTargetId: error?.details?.birthTeamDocumentId || '',
      })
      setStatus('failed')
      setMessage(describe(error))
    } finally {
      busy.current = false
    }
  }

  const approve = async () => {
    if (busy.current || status !== 'preview') return
    busy.current = true
    setStatus('writing')
    try {
      const approvedState = buildClearLeagueTeamsApprovedState(proposal)
      const receiptId = await startClearLeagueTeamsSession(approvedState)
      setSession({ approvedState, receiptId })
      setStatus('steps')
    } catch (error) {
      setStatus('failed')
      setMessage(describe(error))
    } finally {
      busy.current = false
    }
  }

  const next = async () => {
    if (busy.current || status !== 'steps' || !session) return
    busy.current = true
    setStatus('writing')
    const step = CLEAR_LEAGUE_STEPS[stepIndex]
    try {
      if (step) {
        await writeClearLeagueTeamsStep({
          approvedState: session.approvedState, step: step.id,
          onProgress: value => setCounts(previous => ({ ...previous, [step.id]: value })),
        })
        try {
          await reportClearLeagueStep(session.receiptId, step.id)
        } catch (error) {
          error.failedTarget = { targetType: 'writeAction', documentId: session.receiptId }
          throw error
        }
        setStepIndex(value => value + 1)
        setStatus('steps')
      } else {
        const audit = await finishClearLeagueTeamsSession(session)
        if (audit.result !== 'clean') {
          const error = new Error('Audit findings')
          const finding = audit.findings.find(item => item.documentId)
          error.failedTarget = finding ? { targetType: finding.target, documentId: finding.documentId } : null
          throw error
        }
        setStatus('succeeded')
        setMessage('קבוצות העונה נמחקו והביקורת הושלמה בהצלחה.')
        try {
          await reload?.()
        } catch (error) {
          setMessage('המחיקה והביקורת הסתיימו בהצלחה, אך רענון התצוגה נכשל. יש לרענן את העמוד.')
        }
      }
    } catch (error) {
      let receiptError = false
      try {
        await reportClearLeagueFailure(session.receiptId, step?.id || 'audit', error)
      } catch (failure) {
        receiptError = true
      }
      let reloadError = false
      try {
        await reload?.()
      } catch (failure) {
        reloadError = true
      }
      setStatus('failed')
      setMessage(`הפעולה נעצרה בשלב ${step?.label || 'ביקורת'}. יש לבצע הכנה ואישור חדשים לאותה פעולה.${receiptError ? ' גם תיעוד הכשל לא נשמר.' : ''}${reloadError ? ' רענון התצוגה נכשל; יש לרענן את העמוד.' : ''}`)
    } finally {
      busy.current = false
    }
  }

  return {
    open, status, proposal, counts, message, stepIndex,
    disabled: !leagueId || !seasonKey || eligibility?.allowed === false || ['preparing', 'writing', 'steps'].includes(status),
    disabledReason: eligibility?.reason || (!leagueId || !seasonKey ? 'יש לבחור עונת ליגה.' : ''),
    nextDeleteAction: eligibility?.nextAction || '',
    nextDeleteTargetId: eligibility?.nextTargetId || '',
    alreadyCleared: eligibility?.alreadyCleared === true,
    openModal: prepare, retry: prepare, approve, next,
    recheck: async () => setEligibility(await checkEligibility()),
    close: () => { if (!busy.current && status !== 'steps') setOpen(false) },
  }
}
