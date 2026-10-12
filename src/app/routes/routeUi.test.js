// src/app/routes/routeUi.test.js
import React, { lazy } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { lazyRoute } from './routeUi.js'

test('keeps the current page visible until destination code is ready', async () => {
  window.history.replaceState({}, '', '/')
  let resolvePage
  const Destination = lazy(() => new Promise(resolve => { resolvePage = resolve }))
  render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Link to='/next'>Next</Link>
      <Routes>
        <Route path='/' element={lazyRoute(<div>Current page</div>, <div>Fallback</div>)} />
        <Route path='/next' element={lazyRoute(<Destination />, <div>Fallback</div>)} />
      </Routes>
    </BrowserRouter>
  )
  fireEvent.click(screen.getByText('Next'))
  expect(screen.getByText('Current page')).toBeVisible()
  expect(screen.queryByText('Fallback')).not.toBeInTheDocument()
  await act(async () => { resolvePage({ default: () => <div>Destination page</div> }) })
  expect(screen.getByText('Destination page')).toBeVisible()
  expect(screen.queryByText('Current page')).not.toBeInTheDocument()
})
