// src/features/playersDatabase/services/write/shared/runWithConcurrency.test.js

import { runWithConcurrency } from './runWithConcurrency.js'

describe('runWithConcurrency', () => {
  it('limits simultaneous work while preserving result order', async () => {
    let active = 0
    let peak = 0

    const results = await runWithConcurrency({
      values: [1, 2, 3, 4, 5],
      limit: 2,
      worker: async value => {
        active += 1
        peak = Math.max(peak, active)
        await new Promise(resolve => setTimeout(resolve, 1))
        active -= 1
        return value * 10
      },
    })

    expect(results).toEqual([10, 20, 30, 40, 50])
    expect(peak).toBeLessThanOrEqual(2)
  })

  it('returns immediately for an empty set', async () => {
    await expect(runWithConcurrency({ values: [] })).resolves.toEqual([])
  })
})
