// src/features/playersDatabase/domain/clubIdentity.test.js

import { appendClubAliases, assertClubNamesAvailable, buildClubChoices, matchClubIdentity } from './clubIdentity.js'

const clubsById = {
  maccabi: { names: { official: 'מכבי תל אביב', display: 'מכבי תל אביב', short: 'מכבי ת״א' }, aliases: ['מכבי תל אביב אבי'] },
  beitar: { names: { official: 'ביתר תל אביב', display: 'ביתר תל אביב', short: 'ביתר ת״א' }, aliases: [] },
}
const clubs = buildClubChoices({ clubsById })

test('matches official, short and learned names without confusing clubs', () => {
  expect(matchClubIdentity('מכבי ת"א', clubs).id).toBe('maccabi')
  expect(matchClubIdentity('בית"ר ת"א', clubs).id).toBe('beitar')
  expect(matchClubIdentity('מכבי תל אביב אבי', clubs).id).toBe('maccabi')
  expect(matchClubIdentity('ת"א', clubs)).toBeNull()
  expect(matchClubIdentity('מכבי תל אביב חדש', clubs)).toBeNull()
})

test('ignores only configured generic suffixes and rejects ambiguous matches', () => {
  expect(matchClubIdentity('ביתר ת"א "צו פיוס"', clubs).id).toBe('beitar')
  expect(matchClubIdentity('ביתר תל אביב (נוער)', clubs).id).toBe('beitar')
  expect(matchClubIdentity('ביתר תל אביב', [...clubs, { id: 'other', name: 'ביתר תל אביב' }])).toBeNull()
})

test('alias additions are idempotent and short names are already recognized', () => {
  const profile = clubsById.maccabi
  expect(appendClubAliases({ profile, aliases: ['מכבי ת"א', 'מכבי תל אביב אבי'] })).toEqual(profile.aliases)
  expect(appendClubAliases({ profile, aliases: ['שם חדש', ' שם חדש '] })).toEqual([...profile.aliases, 'שם חדש'])
  expect(() => assertClubNamesAvailable({ clubId: 'beitar', names: ['מכבי ת"א'], clubsById })).toThrow('כבר משויך')
})
