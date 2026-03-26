// C:\projects\devplan\src\ui\forms\AbilitiesCreateForm.js
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/joy/Box'

import StickyHeaderSection from './ui/abilities/StickyHeaderSection.js'
import GrowthStageSection from './ui/abilities/GrowthStageSection.js'
import DomainsAccordion from './ui/abilities/DomainsAccordion.js'

import { vaSx } from './sx/abilitiesForm.sx.js'

import {
  clean,
  patchAbilityValue,
  patchDomainScoreToItems,
  patchRecalcDomainFromItems,
  calcGroupScore,
} from './helpers/abilities/abilitiesCreateForm.helpers.js'

import {
  pickDraftBits,
  calcHasAtLeastOneAbility,
  calcReady,
  calcPlayers,
  calcDomains,
} from './helpers/abilities/abilitiesCreateForm.derived.js'

const todayYmd = () => {
  const d = new Date()
  const to2 = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${to2(d.getMonth() + 1)}-${to2(d.getDate())}`
}

export default function AbilitiesCreateForm({ draft, onDraft, onValidChange, context }) {
  const d = draft || {}
  const [isDirty, setIsDirty] = useState(!!d?.isDirty)

  const patch = useCallback(
    (next, opts = {}) => {
      const { silent } = opts || {}
      const nextDraft = { ...d, ...(next || {}) }

      if (!silent && !isDirty) {
        setIsDirty(true)
        nextDraft.isDirty = true
      } else if (isDirty) {
        nextDraft.isDirty = true
      } else {
        nextDraft.isDirty = !!nextDraft.isDirty
      }

      onDraft(nextDraft)
    },
    [d, onDraft, isDirty]
  )

  // hydrate minimal defaults (one-time)
  useEffect(() => {
    const needEvalDate = !clean(d?.evalDate)
    const needAbilities = !d?.abilities || typeof d?.abilities !== 'object'
    const needDomainScores = !d?.domainScores || typeof d?.domainScores !== 'object'

    if (needEvalDate || needAbilities || needDomainScores) {
      patch(
        {
          evalDate: needEvalDate ? todayYmd() : d.evalDate,
          abilities: needAbilities ? {} : d.abilities,
          domainScores: needDomainScores ? {} : d.domainScores,
          isDirty: d?.isDirty || false,
        },
        { silent: true }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bits = useMemo(() => pickDraftBits(d), [d])

  const players = useMemo(
    () => calcPlayers({ context, objectType: bits.objectType, teamId: bits.teamId }),
    [context, bits.objectType, bits.teamId]
  )

  const domains = useMemo(() => {
    const all = calcDomains(bits.abilitiesValues)
    return all.filter(d => d.domain !== 'development')
  }, [bits.abilitiesValues])

  const overallScore = useMemo(() => calcGroupScore(domains), [domains])
  const overallStars = useMemo(() => (overallScore == null ? 0 : Number(overallScore)), [overallScore])

  const hasAtLeastOneAbility = useMemo(() => calcHasAtLeastOneAbility(d), [d])
  const ready = useMemo(
    () =>
      calcReady({
        playerId: bits.playerId,
        roleId: bits.roleId,
        hasGrowthStage: bits.hasGrowthStage,
        hasAtLeastOneAbility,
      }),
    [bits.playerId, bits.roleId, bits.hasGrowthStage, hasAtLeastOneAbility]
  )

  useEffect(() => {
    onValidChange(!!ready)
  }, [ready, onValidChange])

  const canInteract = Boolean(bits.playerId && bits.roleId && bits.hasGrowthStage)

  const onSetPlayerId = (playerId) => patch({ playerId: clean(playerId) || '' })
  const onSetRoleId = (roleId) => patch({ roleId: clean(roleId) || '' })

  const onResetAll = () => patch({ abilities: {}, domainScores: {} })

  const onChangeGrowthStage = (e, val) => {
    patch(patchAbilityValue(d, 'growthStage', val))
  }

  const onSetItemScore = (domain, itemId) => (score) => {
    const step1 = patchAbilityValue(d, itemId, score)

    const nextDomainScores = { ...(step1.domainScores || d.domainScores || {}) }
    delete nextDomainScores[domain]

    const step1Unlocked = {
      ...step1,
      domainScores: nextDomainScores,
    }

    const dom = (domains || []).find((x) => x.domain === domain || x.id === domain) || null
    const domainItems = dom?.items || []
    const step2Patch = patchRecalcDomainFromItems(step1Unlocked, domain, domainItems)

    patch({
      abilities: step1Unlocked.abilities || {},
      domainScores: step2Patch.domainScores || step1Unlocked.domainScores || {},
    })
  }

  const onSetDomainScore = (domain) => (score) => {
    const dom = (domains || []).find((x) => x.domain === domain || x.id === domain) || null
    const domainItems = dom?.items || []
    const next = patchDomainScoreToItems(d, domain, score, domainItems)
    patch(next)
  }

  return (
    <Box sx={vaSx.root}>
      <StickyHeaderSection
        vaSx={vaSx}
        draft={d}
        bits={bits}
        context={context}
        players={players}
        canInteract={true}
        overallScore={overallScore}
        overallStars={overallStars}
        onSetPlayerId={onSetPlayerId}
        onSetRoleId={onSetRoleId}
        onResetAll={onResetAll}
      />

      <Box sx={vaSx.scrollWrap}>
        <GrowthStageSection
          vaSx={vaSx}
          canInteract={Boolean(bits.playerId && bits.roleId)}
          growthStageValue={bits.growthStageValue}
          missingGrowthStage={bits.missingGrowthStage}
          onChange={onChangeGrowthStage}
        />

        <DomainsAccordion
          vaSx={vaSx}
          draft={d}
          bits={bits}
          domains={domains}
          canInteract={canInteract}
          onSetDomainScore={onSetDomainScore}
          onSetItemScore={onSetItemScore}
        />
      </Box>
    </Box>
  )
}
