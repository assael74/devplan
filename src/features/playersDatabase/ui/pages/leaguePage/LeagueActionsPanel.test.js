// src/features/playersDatabase/ui/pages/leaguePage/LeagueActionsPanel.test.js

import { fireEvent, render, screen } from '@testing-library/react'
import LeagueActionsPanel from './LeagueActionsPanel.js'

jest.mock('../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))
jest.mock('../../components/modals/index.js', () => ({ WorkTaskList: () => null }))
jest.mock('../../components/page/PageSidePanel.js', () => ({ children }) => <div>{children}</div>)

test('keeps the page document download and removes the signal refresh action', () => {
  const download = jest.fn()
  render(<LeagueActionsPanel onDownloadDocuments={download} />)
  fireEvent.click(screen.getByRole('button', { name: 'הורדת מסמכי העמוד כ־ZIP' }))
  expect(download).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('button', { name: 'עדכון איתותים' })).not.toBeInTheDocument()
})
