// features/abilitiesPublic/shared/abilitiesPublic.logic.js

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
  calcPublicReady,
  buildPublicCompletionModel,
} from '../shared/abilitiesPublic.derived.js'

import { validatePublicAbilitiesDraft } from '../shared/abilitiesPublic.validate.js'
import { buildPublicAbilitiesSubmitPayload } from '../shared/abilitiesPublic.payloads.js'
import { buildPublicDraftFromInvite } from '../shared/abilitiesPublic.prefill.js'

function clean(value) {
  return String(value ?? '').trim()
}

function normalizeActiveDomains(value) {
  if (!Array.isArray(value)) return []

  const seen = new Set()
  const next = []

  for (const item of value) {
    const id = clean(item)
    if (!id || seen.has(id)) continue
    seen.add(id)
    next.push(id)
  }

  return next
}

function resolveInviteActiveDomains(invite = {}) {
  const rootList = Array.isArray(invite?.activeDomains) ? invite.activeDomains : []
  const metaList = Array.isArray(invite?.meta?.activeDomains) ? invite.meta.activeDomains : []

  const merged = normalizeActiveDomains([...rootList, ...metaList])

  if (!merged.includes('development')) {
    merged.push('development')
  }

  return merged
}

function buildPublicDomainsViewModel(bits = {}, activeDomains = []) {
  const activeSet = new Set(normalizeActiveDomains(activeDomains))
  const allDomains = calcPublicDomains(bits?.abilitiesValues)

  return (Array.isArray(allDomains) ? allDomains : [])
    .filter((domain) => {
      const domainId = clean(domain?.id || domain?.domain)
      return domainId && domainId !== 'development'
    })
    .map((domain) => {
      const domainId = clean(domain?.id || domain?.domain)

      return {
        ...domain,
        id: domain?.id || domainId,
        domain: domain?.domain || domainId,
        active: !activeSet.size || activeSet.has(domainId),
      }
    })
    .sort((a, b) => {
      if (a.active === b.active) return 0
      return a.active ? -1 : 1
    })
}

function filterDomainsByActive(domains = [], activeDomains = []) {
  if (!Array.isArray(domains) || !domains.length) return []

  const normalizedActive = normalizeActiveDomains(activeDomains)
  if (!normalizedActive.length) return domains

  const activeSet = new Set(normalizedActive)

  return domains.filter((domain) => {
    const domainId = clean(domain?.id || domain?.domain)
    return activeSet.has(domainId)
  })
}

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

  const activeDomains = useMemo(() => {
    return resolveInviteActiveDomains(invite)
  }, [invite])

  const domains = useMemo(() => {
    return buildPublicDomainsViewModel(bits, activeDomains)
  }, [bits, activeDomains])

  const validation = useMemo(() => {
    return validatePublicAbilitiesDraft({
      draft,
      domains,
    })
  }, [draft, domains])

  const ready = useMemo(() => {
    return calcPublicReady({ validation })
  }, [validation])

  const completion = useMemo(() => {
    return buildPublicCompletionModel({
      bits,
      domains,
      validation,
    })
  }, [bits, domains, validation])

  const overallScore = useMemo(() => calcGroupScore(domains), [domains])
  const overallStars = useMemo(() => (overallScore == null ? 0 : Number(overallScore)), [overallScore])

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
    const nextValidation = validatePublicAbilitiesDraft({ draft, domains })

    if (!nextValidation.isValid) {
      setSubmitError('הטופס עדיין לא מוכן לשליחה')
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
    activeDomains,
    overallScore,
    overallStars,
    ready,
    validation,
    completion,
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
