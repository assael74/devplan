// src/features/playersDatabase/ui/pages/teamPage/information/model/teamSeasonTabs.model.test.js

import { buildTeamSeasonTabs } from './teamSeasonTabs.model.js'

test('builds clickable season tabs from canonical option keys', () => {
  const tabs = buildTeamSeasonTabs({
    seasonOptions: [
      {
        optionKey: '25/26|2012|u13-center|history',
        seasonKey: '25/26',
        ageGroupLabel: 'ילדים א',
        birthYear: 2012,
      },
      {
        optionKey: '24/25|2012|u12-center|history',
        seasonKey: '24/25',
        ageGroupLabel: 'ילדים ב',
        birthYear: 2012,
      },
    ],
    selectedOptionKey: '25/26|2012|u13-center|history',
  })

  expect(tabs).toEqual([
    expect.objectContaining({
      optionKey: '25/26|2012|u13-center|history',
      label: 'ילדים א · 25/26',
      selected: true,
    }),
    expect.objectContaining({
      optionKey: '24/25|2012|u12-center|history',
      label: 'ילדים ב · 24/25',
      selected: false,
    }),
  ])
})

test('does not use a Team Season document id when canonical options exist', () => {
  const tabs = buildTeamSeasonTabs({
    seasonOptions: [{
      optionKey: '25/26|2012|u13-center|history',
      seasonKey: '25/26',
      ageGroupLabel: 'ילדים א',
    }],
    seasonSnapshots: [{
      seasonKey: 'club-a_2012_1__2025_2026',
      ageGroupLabel: 'ילדים א',
    }],
    selectedOptionKey: '25/26|2012|u13-center|history',
  })

  expect(tabs).toHaveLength(1)
  expect(tabs[0].label).toBe('ילדים א · 25/26')
})
