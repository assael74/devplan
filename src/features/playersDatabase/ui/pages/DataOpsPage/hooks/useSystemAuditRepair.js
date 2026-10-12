// src/features/playersDatabase/ui/pages/DataOpsPage/hooks/useSystemAuditRepair.js

import { useRef, useState } from 'react'

import {
  inspectSystemAuditRepair,
  prepareSystemAuditRepair,
  repairSystemAuditFinding,
} from '../../../../services/audit/system/repair/index.js'

const messageOf = (error, fallback) => error instanceof Error ? error.message : fallback

export default function useSystemAuditRepair({ checks, disabled, onAuditUpdated }) {
  const [pending, setPending] = useState(null)
  const [preparing, setPreparing] = useState(false)
  const [repairing, setRepairing] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const inFlight = useRef(false)

  const reset = () => {
    if (inFlight.current) return
    setPending(null)
    setFeedback(null)
  }

  const prepare = async request => {
    if (inFlight.current) return
    inFlight.current = true
    setPreparing(true)
    const unconfirmedPreview = request.preview
      ? { ...request.preview, previewKey: '', changes: [], reload: null }
      : null
    setPending({ ...request, error: '', preview: unconfirmedPreview })
    try {
      const preview = await prepareSystemAuditRepair({
        finding: request.finding,
        checks: request.checks,
        input: request.input,
      })
      if (preview.audit) onAuditUpdated(preview.audit)
      setPending({ ...request, preview, error: '' })
    } catch (error) {
      if (error && error.auditResult) onAuditUpdated(error.auditResult)
      setPending({
        ...request,
        preview: unconfirmedPreview,
        error: messageOf(error, 'לא ניתן להכין את הצעת התיקון.'),
      })
    } finally {
      inFlight.current = false
      setPreparing(false)
    }
  }

  const requestRepair = finding => {
    if (disabled || inFlight.current || pending) return
    const action = inspectSystemAuditRepair({ finding })
    if (!action.allowed) return
    setFeedback(null)
    prepare({ finding, action, checks: [...checks], input: {}, preview: null, error: '' })
  }

  const changeInput = (name, value) => {
    if (inFlight.current) return
    setPending(current => current ? {
      ...current,
      input: { ...current.input, [name]: value },
      preview: current.preview ? { ...current.preview, previewKey: '', changes: [], reload: null } : null,
      error: '',
    } : current)
  }

  const refreshPreview = () => {
    if (pending && !inFlight.current) prepare(pending)
  }

  const cancelRepair = () => {
    if (!inFlight.current) setPending(null)
  }

  const confirmRepair = async () => {
    const preview = pending && pending.preview
    if (
      disabled
      || inFlight.current
      || !preview
      || !preview.allowed
      || !preview.previewKey
      || preview.skipped
      || preview.reload
    ) return
    const requiredMissing = (Array.isArray(preview.fields) ? preview.fields : []).some(field => (
      field.required && !String(pending.input[field.name] || '').trim()
    ))
    if (requiredMissing) return
    const request = pending
    inFlight.current = true
    setRepairing(true)
    setFeedback(null)
    try {
      const response = await repairSystemAuditFinding({
        finding: request.finding,
        checks: request.checks,
        input: request.input,
        previewKey: preview.previewKey,
        confirmed: true,
      })
      onAuditUpdated(response.audit)
      const remaining = Array.isArray(response.audit && response.audit.findings)
        ? response.audit.findings.length
        : 0
      setFeedback({
        tone: response.repaired || response.skipped ? remaining ? 'warning' : 'success' : 'warning',
        title: response.skipped
          ? 'התוצאות עודכנו מבדיקה חדשה'
          : response.repaired
            ? 'התיקון נשמר והבדיקה הורצה מחדש'
            : 'הפעולה הסתיימה, אך הממצא עדיין מופיע',
        message: response.skipped
          ? 'הממצא כבר אינו קיים. לא נדרשה כתיבה נוספת.'
          : response.repaired
            ? remaining ? `נותרו ${remaining} ממצאים לבדיקה.` : 'לא נותרו ממצאים בהיקף שנבדק.'
            : 'יש לבדוק את התוצאות המעודכנות לפני ניסיון נוסף.',
      })
      setPending(null)
    } catch (error) {
      if (error && error.auditResult) onAuditUpdated(error.auditResult)
      setPending({
        ...request,
        preview: { ...preview, previewKey: '', changes: [], reload: null },
        error: messageOf(error, 'התיקון לא הושלם. יש להכין הצעה מעודכנת לפני ניסיון נוסף.'),
      })
    } finally {
      inFlight.current = false
      setRepairing(false)
    }
  }

  return {
    pending,
    preparing,
    repairing,
    busy: preparing || repairing,
    feedback,
    reset,
    requestRepair,
    changeInput,
    refreshPreview,
    cancelRepair,
    confirmRepair,
  }
}
