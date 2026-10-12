// src/features/playersDatabase/ui/pages/DataOpsPage/hooks/useFocusedAuditRepair.js

import { useRef, useState } from 'react'

import {
  getFocusedAuditFindingKey,
  inspectFocusedAuditRepair,
  repairFocusedAuditFinding,
} from '../../../../services/audit/repair/index.js'

export default function useFocusedAuditRepair({ scope, onAuditUpdated }) {
  const [pending, setPending] = useState(null)
  const [repairingKey, setRepairingKey] = useState('')
  const [feedback, setFeedback] = useState(null)
  const inFlight = useRef(false)

  const reset = () => {
    if (inFlight.current) return
    setPending(null)
    setFeedback(null)
  }

  const requestRepair = finding => {
    if (!scope || inFlight.current) return
    const action = inspectFocusedAuditRepair({ scope, finding })
    if (!action.allowed) return
    setPending({ finding, action, scope: { ...scope } })
  }

  const cancelRepair = () => {
    if (!inFlight.current) setPending(null)
  }

  const confirmRepair = async () => {
    if (!pending || inFlight.current) return
    inFlight.current = true
    setRepairingKey(getFocusedAuditFindingKey(pending.finding))
    setFeedback(null)
    try {
      const response = await repairFocusedAuditFinding({
        scope: pending.scope,
        finding: pending.finding,
        confirmed: true,
      })
      onAuditUpdated(response.audit)
      const remaining = Array.isArray(response.audit && response.audit.findings)
        ? response.audit.findings.length
        : 0
      setFeedback({
        tone: remaining || (!response.repaired && !response.skipped) ? 'warning' : 'success',
        title: response.skipped
          ? 'התוצאות עודכנו מבדיקה חדשה'
          : response.repaired
            ? 'התיקון נשמר והבדיקה הורצה מחדש'
            : 'הפעולה הסתיימה, אך הממצא עדיין מופיע',
        message: response.skipped
          ? 'הממצא שנבחר כבר אינו קיים. לא נדרשה כתיבה נוספת.'
          : response.repaired
            ? remaining ? `נותרו ${remaining} ממצאים לבדיקה.` : 'לא נותרו ממצאים בהיקף שנבדק.'
            : 'יש לבדוק את הנתונים המעודכנים בכרטיס לפני ניסיון נוסף.',
      })
    } catch (error) {
      if (error && error.auditResult) onAuditUpdated(error.auditResult)
      setFeedback({
        tone: 'danger',
        title: 'התיקון לא הושלם',
        message: error instanceof Error ? error.message : 'אירעה שגיאה בתיקון הממצא.',
      })
    } finally {
      inFlight.current = false
      setRepairingKey('')
      setPending(null)
    }
  }

  return {
    pending,
    repairingKey,
    repairing: Boolean(repairingKey),
    feedback,
    reset,
    requestRepair,
    cancelRepair,
    confirmRepair,
  }
}
