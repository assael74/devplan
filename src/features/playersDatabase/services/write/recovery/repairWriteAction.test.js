// src/features/playersDatabase/services/write/recovery/repairWriteAction.test.js

import { inspectWriteActionRepair } from './repairWriteAction.js'

const receipt = overrides => ({
  id: 'receipt-1',
  actionType: 'leagueLoad',
  status: 'open',
  executionStatus: 'failed',
  recoveryRequired: true,
  canonicalOutcome: 'confirmed',
  progress: {
    completedByStage: {
      canonical: {},
    },
  },
  ...overrides,
})

describe('WriteAction projection repair eligibility', () => {
  test('allows a failed receipt whose canonical write was confirmed', () => {
    expect(inspectWriteActionRepair(receipt())).toEqual({
      allowed: true,
      reason: '',
    })
  })

  test('allows projection repair for League Open after canonical confirmation', () => {
    expect(inspectWriteActionRepair(receipt({ actionType: 'leagueOpen' }))).toEqual({
      allowed: true,
      reason: '',
    })
  })

  test('blocks repair when the canonical write was not confirmed', () => {
    expect(inspectWriteActionRepair(receipt({ canonicalOutcome: 'failed_or_unknown' })))
      .toMatchObject({ allowed: false })
  })

  test('requires counterparts evidence for statsLoad without original input', () => {
    const blocked = inspectWriteActionRepair(receipt({
      actionType: 'statsLoad',
      progress: { completedByStage: { canonical: {} } },
    }))
    const allowed = inspectWriteActionRepair(receipt({
      actionType: 'statsLoad',
      progress: { completedByStage: { canonical: {}, counterparts: {} } },
    }))

    expect(blocked).toMatchObject({ allowed: false })
    expect(allowed).toEqual({ allowed: true, reason: '' })
  })

  test('does not reopen a closed successful receipt', () => {
    expect(inspectWriteActionRepair(receipt({
      status: 'closed',
      executionStatus: 'succeeded',
      recoveryRequired: false,
    }))).toMatchObject({ allowed: false })
  })
})
