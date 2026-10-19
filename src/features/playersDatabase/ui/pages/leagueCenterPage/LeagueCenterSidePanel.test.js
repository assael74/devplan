// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterSidePanel.test.js

import { fireEvent, render, screen } from '@testing-library/react'
import LeagueCenterSidePanel from './LeagueCenterSidePanel.js'

jest.mock('../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))
jest.mock('../../components/page/InfoPanel.js', () => ({ children }) => <div>{children}</div>)
jest.mock('./LeagueCenterWorkArea.js', () => () => null)

test('document download is available only in the expanded side panel and respects loading', () => {
  const onDownloadDocuments = jest.fn()
  const { rerender } = render(
    <LeagueCenterSidePanel collapsible collapsed={false} tasks={[]} onDownloadDocuments={onDownloadDocuments} />
  )
  fireEvent.click(screen.getByRole('button', { name: 'הורדת מסמכי העמוד כ־ZIP' }))
  expect(onDownloadDocuments).toHaveBeenCalledTimes(1)

  rerender(
    <LeagueCenterSidePanel collapsible collapsed={false} tasks={[]} onDownloadDocuments={onDownloadDocuments} downloadDisabled />
  )
  const button = screen.getByRole('button', { name: 'הורדת מסמכי העמוד כ־ZIP' })
  expect(button).toBeDisabled()
  fireEvent.click(button)
  expect(onDownloadDocuments).toHaveBeenCalledTimes(1)

  rerender(
    <LeagueCenterSidePanel collapsible collapsed tasks={[]} onDownloadDocuments={onDownloadDocuments} />
  )
  expect(screen.queryByRole('button', { name: 'הורדת מסמכי העמוד כ־ZIP' })).not.toBeInTheDocument()
})
