// src/application/auth/AuthProvider.test.js

import * as React from 'react'
import { act, render, screen } from '@testing-library/react'
import { onAuthStateChanged } from 'firebase/auth'

import { clearPlayersDatabaseDocumentCache } from '../../features/playersDatabase/services/cache/index.js'
import { resetPlayersDatabaseTasksSubscription } from '../../features/playersDatabase/services/read/index.js'
import { AuthProvider, useAuth } from './AuthProvider.js'

jest.mock('firebase/auth', () => ({ onAuthStateChanged: jest.fn() }))
jest.mock('../../services/firebase/firebase', () => ({ auth: {} }))
jest.mock('../../services/auth/auth.api', () => ({ authApi: { login: jest.fn(), logout: jest.fn() } }))
jest.mock('../../services/auth/registerExternalUser.js', () => ({ registerExternalUser: jest.fn() }))
jest.mock('../../features/playersDatabase/services/cache/index.js', () => ({
  clearPlayersDatabaseDocumentCache: jest.fn(),
}))
jest.mock('../../features/playersDatabase/services/read/index.js', () => ({
  resetPlayersDatabaseTasksSubscription: jest.fn(),
}))

let authCallback
let mountCount = 0

function Consumer() {
  const { user } = useAuth()
  React.useEffect(() => {
    mountCount += 1
  }, [])
  return <div>{user?.uid || 'none'}</div>
}

beforeEach(() => {
  jest.clearAllMocks()
  mountCount = 0
  onAuthStateChanged.mockImplementation((auth, callback) => {
    authCallback = callback
    return jest.fn()
  })
})

test('changing uid clears PlayersDatabase store and remounts authenticated children', async () => {
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  await act(async () => {
    authCallback({ uid: 'user-a' })
  })
  expect(screen.getByText('user-a')).toBeInTheDocument()
  expect(mountCount).toBe(1)

  await act(async () => {
    authCallback({ uid: 'user-b' })
  })
  expect(screen.getByText('user-b')).toBeInTheDocument()
  expect(clearPlayersDatabaseDocumentCache).toHaveBeenCalledTimes(1)
  expect(resetPlayersDatabaseTasksSubscription).toHaveBeenCalledTimes(1)
  expect(mountCount).toBe(2)
})
