// src/features/playersDatabase/services/write/club/clubIdentity.write.test.js

import { trackedGetDocsFromServer, trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { buildClubDirectoryProjection } from '../../../domain/projections/club/clubDirectory.projection.js'
import { updateClubIdentity } from './clubIdentity.write.js'
import { writeLeagueCanonical } from '../league/writeLeagueCanonical.js'

jest.mock('firebase/firestore', () => ({
  doc: (_db, name, id) => ({ path: `${name}/${id}` }),
  collection: (_db, name) => ({ path: name }),
  FieldPath: class { constructor(...parts) { this.parts = parts } },
  Timestamp: { now: () => 'timestamp' },
  setDoc: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocsFromServer: jest.fn(),
  trackedRunTransaction: jest.fn(),
}))
jest.mock('../../cache/index.js', () => ({ invalidateDocumentCacheByPrefixKeepingSnapshot: jest.fn() }))

let documents
let committed
const ref = path => ({ path })
const snapshot = reference => ({
  ref: reference,
  exists: () => Boolean(documents[reference.path]),
  data: () => documents[reference.path],
})
const setPath = (target, parts, value) => {
  let current = target
  parts.slice(0, -1).forEach(key => { current[key] = current[key] || {}; current = current[key] })
  current[parts[parts.length - 1]] = value
}

beforeEach(() => {
  jest.clearAllMocks()
  const club = {
    clubId: 'a', externalClubId: 'external', clubUrl: 'https://example.com',
    names: { official: 'מועדון א', display: 'מועדון א', short: 'א', source: 'מקור' },
    aliases: ['ישן'], searchAliases: ['חיפוש'], clubLevel: 2, clubStrengthLevel: 3,
    timestamps: { createdAt: 'created', updatedAt: 'old' }, manual: { keep: true },
  }
  documents = {
    'dbClubs/a': club,
    'dbClubsDirectory/all': { clubsById: {
      a: buildClubDirectoryProjection({ profile: club }),
      b: { names: { display: 'מועדון ב', short: 'ב' }, aliases: ['תפוס'] },
    } },
    'dbClubsCenter/past': { clubsById: { a: { displayName: 'מועדון א', shortName: 'א', teamsById: { team: { stats: 'keep' } } }, b: { displayName: 'מועדון ב' } } },
    'dbClubsCenter/current': { clubsById: { a: { displayName: 'מועדון א', shortName: 'א', teamsById: {} } } },
  }
  committed = []
  trackedGetDocsFromServer.mockResolvedValue({ docs: ['past', 'current'].map(id => snapshot(ref(`dbClubsCenter/${id}`))) })
  trackedRunTransaction.mockImplementation(async (_db, callback) => {
    const pending = []
    const result = await callback({
      get: async reference => {
        if (pending.length) throw new Error('read after write')
        return snapshot(reference)
      },
      update: (...args) => pending.push(['update', ...args]),
      set: (...args) => pending.push(['set', ...args]),
    })
    pending.forEach(([kind, reference, ...args]) => {
      if (kind === 'set') documents[reference.path] = args[0]
      else if (args.length === 1) Object.entries(args[0]).forEach(([path, value]) => setPath(documents[reference.path], path.split('.'), value))
      else for (let index = 0; index < args.length; index += 2) {
        setPath(documents[reference.path], args[index].parts || args[index].split('.'), args[index + 1])
      }
    })
    committed.push(...pending)
    return result
  })
})

const load = alias => writeLeagueCanonical({ approvedState: {
  leagueId: 'league', document: { leagueId: 'league', seasonsById: {} },
  clubAliasEdits: [{ clubId: 'a', aliases: [alias] }],
} })

test('league and learned alias commit atomically and a retry does not duplicate aliases', async () => {
  await load('שם בטבלה')
  expect(documents['dbLeagues/league']).toBeDefined()
  expect(documents['dbClubs/a'].aliases).toEqual(['ישן', 'שם בטבלה'])
  expect(documents['dbClubsDirectory/all'].clubsById.a.aliases).toEqual(['ישן', 'שם בטבלה'])
  expect(documents['dbClubs/a'].timestamps).toEqual({ createdAt: 'created', updatedAt: 'timestamp' })
  committed = []
  await load('שם בטבלה')
  expect(committed.map(item => item[0])).toEqual(['set'])
})

test('collision or missing source prevents league and alias writes together', async () => {
  await expect(load('תפוס')).rejects.toThrow('כבר משויך')
  expect(committed).toEqual([])
  expect(documents['dbLeagues/league']).toBeUndefined()
  delete documents['dbClubs/a']
  await expect(load('שם חדש')).rejects.toThrow('מחויב חסר')
  expect(committed).toEqual([])
})

test('name edit updates every existing center and preserves canonical and seasonal fields', async () => {
  const teams = JSON.stringify(documents['dbClubsCenter/past'].clubsById.a.teamsById)
  await updateClubIdentity({ clubId: 'a', displayName: 'תצוגה חדשה', shortName: 'קצר', aliases: ['חדש'] })
  expect(documents['dbClubs/a']).toMatchObject({
    externalClubId: 'external', clubLevel: 2, clubUrl: 'https://example.com', manual: { keep: true },
    names: { official: 'מועדון א', source: 'מקור', display: 'תצוגה חדשה', short: 'קצר' },
    aliases: ['חדש'], searchAliases: [],
  })
  for (const id of ['past', 'current']) {
    expect(documents[`dbClubsCenter/${id}`].clubsById.a).toMatchObject({ displayName: 'תצוגה חדשה', shortName: 'קצר' })
  }
  expect(JSON.stringify(documents['dbClubsCenter/past'].clubsById.a.teamsById)).toBe(teams)
  expect(documents['dbClubsCenter/past'].clubsById.b).toEqual({ displayName: 'מועדון ב' })
})

test('unchanged editor input performs no writes and no-op does not change timestamps', async () => {
  const result = await updateClubIdentity({ clubId: 'a', displayName: 'מועדון א', shortName: 'א', aliases: ['ישן'] })
  // Removing the independent search alias is an explicit edit.
  expect(result.changedCount).toBe(2)
  committed = []
  expect(await updateClubIdentity({ clubId: 'a', displayName: 'מועדון א', shortName: 'א', aliases: ['ישן'] })).toEqual({ completed: true, changedCount: 0 })
  expect(committed).toEqual([])
})
