// src/features/playersDatabase/ui/components/scout/shared/scoutDisplay.model.test.js

import { buildScoutCompactView } from './scoutDisplay.model.js'

describe('Scout display model', () => {
  test('renders the canonical Hebrew label instead of an internal profile id', () => {
    const view = buildScoutCompactView({
      profiles: [{
        profileId: 'double_digit_threat',
        profileStrength: { depthPct: 70 },
      }],
      display: {
        label: 'double_digit_threat',
      },
    })

    expect(view.label).toBe('תפוקה דו־ספרתית')
    expect(view.compactLabel).toBe('דו־ספרתי')
    expect(view.tooltipTitle).toBe('תפוקה דו־ספרתית')
  })

  test('resolves a persisted combination id to its canonical display definition', () => {
    const view = buildScoutCompactView({
      profiles: [],
      combinations: ['elite_finisher'],
    })

    expect(view.primaryItem).toEqual(expect.objectContaining({
      type: 'combination',
      id: 'elite_finisher',
      label: 'מסיים עילית',
    }))
  })
})
