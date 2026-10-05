// src/features/playersDatabase/domain/club/bootstrapClubCatalog.builder.test.js

import {
  buildClubBootstrapApprovedState,
  compareClubBootstrapState,
} from './bootstrapClubCatalog.builder.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'

const catalog = [{
  id: 'club-a',
  name: 'מועדון א',
  shortName: 'א',
  clubLevel: 2,
  clubStrengthLevel: 1.5,
  aliases: ['אחד'],
  searchAliases: ['מועדון א', 'אחד'],
}]

describe('buildClubBootstrapApprovedState', () => {
  test('builds ClubProfile and ClubsDirectory before writing', () => {
    const state = buildClubBootstrapApprovedState({ catalog })

    expect(state.mode).toBe('create')
    expect(state.profiles[0]).toEqual(expect.objectContaining({
      clubId: 'club-a',
      clubLevel: 2,
      clubStrengthLevel: 1.5,
    }))
    expect(state.directory.clubsById['club-a']).toEqual(expect.objectContaining({
      clubLevel: 2,
      clubStrengthLevel: 1.5,
    }))
    expect(state.profiles[0].names.source).toBe('מועדון א')
    expect(state.directory.clubsById['club-a'].names).toEqual({
      official: 'מועדון א',
      display: 'מועדון א',
      short: 'א',
    })
    expect(state.directory.clubsById['club-a'].names.source).toBeUndefined()
    expect(state.directory.clubsById['club-a'].externalClubId).toBeUndefined()
  })

  test('accepts an exact previous result for a fresh retry', () => {
    const first = buildClubBootstrapApprovedState({ catalog })
    const second = buildClubBootstrapApprovedState({
      catalog,
      existingProfiles: first.profiles,
      existingDirectory: first.directory,
    })

    expect(second.mode).toBe('alreadyApplied')
    expect(compareClubBootstrapState({
      approvedState: first,
      profiles: first.profiles,
      directory: first.directory,
    })).toEqual([])
  })

  test('rejects partial or different persisted data', () => {
    expect(() => buildClubBootstrapApprovedState({
      catalog,
      existingProfiles: [],
      existingDirectory: { clubsById: {} },
    })).toThrow('empty database or an exact previous result')
  })

  test('rejects invalid catalog identity, aliases and URL values', () => {
    expect(() => buildClubBootstrapApprovedState({
      catalog: [{ ...catalog[0], id: 'Club A' }],
    })).toThrow('Catalog clubId is invalid')
    expect(() => buildClubBootstrapApprovedState({
      catalog: [{ ...catalog[0], aliases: 'אחד' }],
    })).toThrow('Catalog aliases for club-a must be an array')
    expect(() => buildClubBootstrapApprovedState({
      catalog: [{ ...catalog[0], clubUrl: 'not-a-url' }],
    })).toThrow('Catalog clubUrl is invalid')
  })

  test('builds the live catalog within one Firestore transaction limit', () => {
    const state = buildClubBootstrapApprovedState({
      catalog: PLAYERS_DATABASE_CLUBS_CATALOG,
    })

    expect(state.profiles).toHaveLength(PLAYERS_DATABASE_CLUBS_CATALOG.length)
    expect(state.profiles.length + 1).toBeLessThanOrEqual(500)
    expect(state.profiles.every(profile => !Object.prototype.hasOwnProperty.call(
      profile,
      'ageGroups',
    ))).toBe(true)
  })
})
