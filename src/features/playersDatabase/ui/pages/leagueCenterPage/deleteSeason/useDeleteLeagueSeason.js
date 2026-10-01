// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/useDeleteLeagueSeason.js

import * as React from 'react'
import { approveDeleteSeason } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js'
import { prepareDeleteLeagueSeason } from '../../../../services/writeV2/league/deleteSeason/prepareDeleteLeagueSeason.js'
import { startDeleteSeasonSession, writeDeleteSeasonStep, failDeleteSeasonSession, finishDeleteSeasonSession } from '../../../../services/writeV2/league/deleteSeason/deleteLeagueSeasonSession.js'

export const DELETE_SEASON_STEPS = [
  { id: 'league', label: 'מסמך הליגה' },
  { id: 'leaguesMaster', label: 'מרכז הליגות' },
  { id: 'audit', label: 'ביקורת מהשרת' },
]
const describe = error => ({
  DELETE_SEASON_TABLE_LOADED: 'יש לבצע מחיקת קבוצות ליגה תחילה, גם כשהטבלה ריקה.',
  DELETE_SEASON_DEPENDENCIES: 'נותרו עונות קבוצה. יש להשלים מחיקת קבוצות ליגה.',
  DELETE_SEASON_PROJECTIONS: 'נותרו נתונים המשויכים לעונה. יש להשלים מחיקת קבוצות או תיקון הקרנות.',
  DELETE_SEASON_RELATION: 'נמצאה הפניית קבוצה לא תקינה. נדרשת בדיקת נתונים.',
  DELETE_SEASON_LEAGUE_MISSING: 'מסמך הליגה חסר. ישות הליגה חייבת להישמר.',
  DELETE_SEASON_RECEIPTS: 'נמצאו כמה תיעודי מחיקה פתוחים לעונה הזאת. נדרשת בדיקת התיעוד.',
  DELETE_SEASON_CHANGED: 'הנתונים השתנו. יש לבצע הכנה ואישור מחדש.',
}[error?.code] || 'לא ניתן להשלים את הפעולה. יש לבדוק את נתוני הליגה והעונה.')
const targetOf = row => ({ leagueId: row.leagueId, seasonKey: row.seasonKey })

export default function useDeleteLeagueSeason({ reload }) {
  const [selected, setSelected] = React.useState(null)
  const [status, setStatus] = React.useState('idle')
  const [proposal, setProposal] = React.useState(null)
  const [session, setSession] = React.useState(null)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [counts, setCounts] = React.useState({})
  const [message, setMessage] = React.useState('')
  const busy = React.useRef(false)
  const availability = React.useCallback(row => {
    if (!row.seasonKey || row.seasonKey === 'all') return { allowed: false, reason: 'יש לבחור עונה מסוימת.' }
    if (selected && ['preparing', 'writing', 'steps'].includes(status)) return { allowed: false, reason: 'פעולת המחיקה בביצוע.' }
    return { allowed: true, label: 'מחיקת עונה', reason: 'תנאי המחיקה ייבדקו לאחר הלחיצה' }
  }, [selected, status])

  const prepare = async row => {
    if (busy.current) return
    busy.current = true
    setSelected(row)
    setStatus('preparing')
    setProposal(null)
    setMessage('')
    setCounts({})
    setStepIndex(0)
    try {
      setProposal(await prepareDeleteLeagueSeason(targetOf(row)))
      setStatus('preview')
    } catch (error) {
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
      const approvedState = approveDeleteSeason(proposal)
      const receiptId = await startDeleteSeasonSession(approvedState)
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
    const step = DELETE_SEASON_STEPS[stepIndex]
    try {
      if (step.id !== 'audit') {
        const result = await writeDeleteSeasonStep({ ...session, step: step.id })
        setCounts(value => ({ ...value, [step.id]: result }))
        setStepIndex(value => value + 1)
        setStatus('steps')
      } else {
        const audit = await finishDeleteSeasonSession(session)
        if (audit.result !== 'clean') {
          const error = new Error('Audit incomplete')
          const finding = audit.findings.find(row => row.documentId)
          error.failedTarget = finding ? { targetType: finding.target, documentId: finding.documentId } : null
          throw error
        }
        setStatus('succeeded')
        setMessage('העונה נמחקה. זהות הליגה נשמרה והביקורת הושלמה בהצלחה.')
        try { await reload({ fromServer: true }) }
        catch (error) { setMessage('המחיקה הצליחה, אך רענון המרכז נכשל. יש לרענן את העמוד.') }
      }
    } catch (error) {
      let suffix = ''
      try { await failDeleteSeasonSession({ ...session, step: step.id, error }) }
      catch (failure) { suffix = ' גם תיעוד הכשל לא נשמר.' }
      try { await reload({ fromServer: true }) }
      catch (failure) { suffix += ' רענון המרכז נכשל.' }
      setCounts(value => ({ ...value, [step.id]: { written: 0, skipped: 0, failed: 1 } }))
      setStatus('failed')
      setMessage(`הפעולה נעצרה בשלב ${step.label}. יש להכין ולאשר מחדש.${suffix}`)
    } finally {
      busy.current = false
    }
  }
  return {
    selected, status, proposal, counts, stepIndex, message, availability,
    open: prepare, retry: () => prepare(selected), approve, next,
    close: () => { if (!busy.current && status !== 'steps') setSelected(null) },
  }
}
