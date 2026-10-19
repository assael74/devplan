// src/features/firestoreUsage/components/UsageDocumentsTable.test.js

import React from 'react'
import { render, screen } from '@testing-library/react'
import UsageDocumentsTable from './UsageDocumentsTable.js'

test('distinguishes a document size from its repeated read total', () => {
  render(<UsageDocumentsTable rows={[{
    path: 'dbLeaguesCenter/all', lastReadKb: 500, maxReadKb: 500,
    reads: 2, cacheReads: 0, estimatedReadKb: 1000,
  }]} />)
  expect(screen.getByText('dbLeaguesCenter/all')).toBeVisible()
  expect(screen.getByText('500 KB')).toBeVisible()
  expect(screen.getByText('1,000 KB')).toBeVisible()
  expect(screen.getByRole('columnheader', { name: 'נפח שרת מצטבר' })).toBeVisible()
})
