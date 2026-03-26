import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  patchAbilityValue,
  patchDomainScoreToItems,
  patchRecalcDomainFromItems,
  calcGroupScore,
} from '../shared/abilitiesPublic.helpers.js'

import {
  pickPublicDraftBits,
  calcPublicDomains,
  calcPublicHasAtLeastOneAbility,
  calcPublicReady,
} from '../shared/abilitiesPublic.derived.js'

import { validatePublicAbilitiesDraft } from '../shared/abilitiesPublic.validate.js'
import { buildPublicAbilitiesSubmitPayload } from '../shared/abilitiesPublic.payloads.js'
import { buildPublicDraftFromInvite } from '../shared/abilitiesPublic.prefill.js'

export function useAbilitiesPublicForm({ invite, onSubmit }) {
  const [draft, setDraft] = useState(() => buildPublicDraftFromInvite(invite))
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setDraft(buildPublicDraftFromInvite(invite))
    setSubmitError('')
    setSubmitted(false)
  }, [invite])

  const bits = useMemo(() => pickPublicDraftBits(draft), [draft])

  const domains = useMemo(() => {
    return calcPublicDomains(bits.abilitiesValues)
  }, [bits.abilitiesValues])

  const overallScore = useMemo(() => calcGroupScore(domains), [domains])
  const overallStars = useMemo(() => (overallScore == null ? 0 : Number(overallScore)), [overallScore])

  const hasAtLeastOneAbility = useMemo(() => {
    return calcPublicHasAtLeastOneAbility(draft)
  }, [draft])

  const ready = useMemo(() => {
    return calcPublicReady({
      roleId: bits.roleId,
      hasGrowthStage: bits.hasGrowthStage,
      hasAtLeastOneAbility,
    })
  }, [bits.roleId, bits.hasGrowthStage, hasAtLeastOneAbility])

  const validation = useMemo(() => validatePublicAbilitiesDraft(draft), [draft])

  const patch = useCallback((next) => {
    setDraft((prev) => ({
      ...prev,
      ...(next || {}),
      isDirty: true,
    }))
  }, [])

  const onSetRoleId = useCallback((roleId) => {
    patch({ roleId: roleId || '' })
  }, [patch])

  const onChangeGrowthStage = useCallback((e, value) => {
    setDraft((prev) => patchAbilityValue({ ...prev, isDirty: true }, 'growthStage', value))
  }, [])

  const onResetAll = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      abilities: prev?.abilities?.growthStage != null ? { growthStage: prev.abilities.growthStage } : {},
      domainScores: {},
      isDirty: true,
    }))
  }, [])

  const onSetItemScore = useCallback((domainId, itemId) => (score) => {
    setDraft((prev) => {
      const step1 = patchAbilityValue(prev, itemId, score)

      const nextDomainScores = { ...(step1?.domainScores || {}) }
      delete nextDomainScores[domainId]

      const step1Unlocked = {
        ...step1,
        domainScores: nextDomainScores,
        isDirty: true,
      }

      const domain = (domains || []).find((x) => x.domain === domainId || x.id === domainId) || null
      const domainItems = domain?.items || []
      const step2 = patchRecalcDomainFromItems(step1Unlocked, domainId, domainItems)

      return {
        ...step1Unlocked,
        domainScores: step2?.domainScores || {},
        isDirty: true,
      }
    })
  }, [domains])

  const onSetDomainScore = useCallback((domainId) => (score) => {
    setDraft((prev) => {
      const domain = (domains || []).find((x) => x.domain === domainId || x.id === domainId) || null
      const domainItems = domain?.items || []

      return {
        ...patchDomainScoreToItems(prev, domainId, score, domainItems),
        isDirty: true,
      }
    })
  }, [domains])

  const handleSubmit = useCallback(async () => {
    const nextValidation = validatePublicAbilitiesDraft(draft)

    if (!nextValidation.isValid) {
      setSubmitError('הטופס לא מוכן לשליחה')
      return null
    }

    if (typeof onSubmit !== 'function') {
      setSubmitError('חסר onSubmit')
      return null
    }

    try {
      setSubmitting(true)
      setSubmitError('')

      const payload = buildPublicAbilitiesSubmitPayload(draft)
      await onSubmit(payload)

      setSubmitted(true)
      return payload
    } catch (error) {
      setSubmitError(error?.message || 'שליחת הטופס נכשלה')
      return null
    } finally {
      setSubmitting(false)
    }
  }, [draft, onSubmit])

  return {
    draft,
    bits,
    domains,
    overallScore,
    overallStars,
    ready,
    validation,
    submitting,
    submitError,
    submitted,

    onSetRoleId,
    onChangeGrowthStage,
    onResetAll,
    onSetItemScore,
    onSetDomainScore,
    handleSubmit,
  }
}
