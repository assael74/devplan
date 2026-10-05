// src/features/playersDatabase/ui/favorites/PlayersDatabaseFavoritesProvider.test.js

import { fireEvent, render, screen } from '@testing-library/react'

import {
  PlayersDatabaseFavoritesProvider,
  usePlayersDatabaseFavorites,
} from './PlayersDatabaseFavoritesProvider.js'

function Consumer() {
  const favorites = usePlayersDatabaseFavorites()

  return (
    <div>
      <span>{favorites.loading ? 'loading' : 'ready'}</span>
      <span>{favorites.playerFavorites.length}</span>
      <button type='button' onClick={() => favorites.addFavorite({ entityId: 'player-1' })}>
        add
      </button>
      <button type='button' onClick={() => favorites.removeFavorite({ entityId: 'player-1' })}>
        remove
      </button>
    </div>
  )
}

test('provides an inactive Favorites context without reading or changing state', () => {
  render(
    <PlayersDatabaseFavoritesProvider>
      <Consumer />
    </PlayersDatabaseFavoritesProvider>
  )

  expect(screen.getByText('ready')).toBeInTheDocument()
  expect(screen.getByText('0')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'add' }))
  fireEvent.click(screen.getByRole('button', { name: 'remove' }))

  expect(screen.getByText('0')).toBeInTheDocument()
})
