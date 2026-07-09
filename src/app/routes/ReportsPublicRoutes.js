import React from 'react'
import { Route } from 'react-router-dom'

export default function buildReportsPublicRoutes({
  lazyRoute,
  PublicReportPage,
}) {
  return (
    <>
      <Route
        path='/r/:reportId'
        element={lazyRoute(<PublicReportPage />)}
      />

      <Route
        path='/r/:reportId/:versionId'
        element={lazyRoute(<PublicReportPage />)}
      />
    </>
  )
}
