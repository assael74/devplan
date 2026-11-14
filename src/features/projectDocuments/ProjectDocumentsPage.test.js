// src/features/projectDocuments/ProjectDocumentsPage.test.js
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ProjectDocumentsPage from './ProjectDocumentsPage.js'
import { readProjectDocuments } from './projectDocuments.api.js'
import { documentUrl } from './projectDocuments.model.js'

jest.mock('./projectDocuments.api.js', () => ({ readProjectDocuments: jest.fn() }))

const guide = { id: 'README.md', title: 'מדריך DevPlan' }
const structure = { id: 'docs/architecture/PROJECT_STRUCTURE.md', title: 'מבנה הפרויקט' }

function renderPage(path = '/dev/documents') {
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProjectDocumentsPage />
    </MemoryRouter>
  )
}

test('finds a document by filename and follows a link inside the reader', async () => {
  readProjectDocuments.mockImplementation(async id => {
    if (id === structure.id) {
      return { title: structure.title, html: '<a href="?doc=README.md">למדריך</a>' }
    }
    if (id === guide.id) return { title: guide.title, html: '<p>תוכן המדריך</p>' }
    return { documents: [guide, structure] }
  })
  renderPage()

  expect(await screen.findByRole('link', { name: guide.title })).toBeInTheDocument()
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'project_structure' } })
  expect(screen.queryByRole('link', { name: guide.title })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('link', { name: structure.title }))

  fireEvent.click(await screen.findByRole('link', { name: 'למדריך' }))
  expect(await screen.findByRole('heading', { name: guide.title })).toBeInTheDocument()
  expect(await screen.findByText('תוכן המדריך')).toBeInTheDocument()
})

test('shows a missing document message for an invalid direct link', async () => {
  readProjectDocuments.mockImplementation(async id => {
    if (id === undefined) return { documents: [guide] }
    throw Object.assign(new Error('Not found'), { code: 'functions/not-found' })
  })
  renderPage(documentUrl('gone.md'))

  expect(await screen.findByText('המסמך לא נמצא בספרייה.')).toBeInTheDocument()
})
