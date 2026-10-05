// src/features/playersDatabase/ui/favorites/favoritesInactive.boundary.test.mjs

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const featureRoot = new URL('../../', import.meta.url)
const read = relativePath => readFile(new URL(relativePath, featureRoot), 'utf8')

test('active Favorites context cannot read or write persisted data', async () => {
  const provider = await read('ui/favorites/PlayersDatabaseFavoritesProvider.js')
  const readEntry = await read('services/read/index.js')
  const constants = await read('constants/pdb.constants.js')

  assert.doesNotMatch(provider, /firebase|services\/read|services\/write/)
  assert.match(provider, /addFavorite: \(\) => Promise\.resolve\(null\)/)
  assert.match(provider, /removeFavorite: \(\) => Promise\.resolve\(null\)/)
  assert.doesNotMatch(readEntry, /favorites\.read|readFavorites/)
  assert.doesNotMatch(constants, /^\s+favorites:/m)
})

test('Favorite symbol remains visible but has no action', async () => {
  const button = await read('ui/components/actions/FavoriteButton.js')

  assert.match(button, /<StarBorder \/>/)
  assert.match(button, /\sdisabled\s/)
  assert.doesNotMatch(button, /onClick|onToggle/)
})
