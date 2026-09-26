import {
  pickOwnedFields,
  STATS_PLAYER_INDEX_OWNED_FIELDS,
  STATS_TEAM_INDEX_OWNED_FIELDS,
} from './statsProjectionOwnership.js'

describe('Stats V2 projection ownership', () => {
  test('protects manual Player SearchIndex fields', () => {
    expect(() => pickOwnedFields({
      fields: { notes: 'manual note' },
      allowed: STATS_PLAYER_INDEX_OWNED_FIELDS,
    })).toThrow('outside ownership')
  })

  test('protects League performance fields in Team SearchIndex', () => {
    expect(() => pickOwnedFields({
      fields: { tableRank: 1 },
      allowed: STATS_TEAM_INDEX_OWNED_FIELDS,
    })).toThrow('outside ownership')
  })
})
