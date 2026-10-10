// src/features/playersDatabase/ui/components/sync/SyncStatusHeader.test.js

import { render, screen } from '@testing-library/react'

import SyncStatusHeader from './SyncStatusHeader.js'

test('keeps the receipt beside the status title', () => {
  render(<SyncStatusHeader title='טעינת הסגל מתבצעת' receiptId='receipt-1' />)

  const title = screen.getByText('טעינת הסגל מתבצעת')
  expect(title.parentElement).toHaveTextContent('קבלה: receipt-1')
})
