// src/features/hub/teamProfile/sharedUi/players/print/url/UrlReport.js

import React from 'react'

import UrlDesktop from './UrlDesktop.js'
import UrlMobile from './UrlMobile.js'
import UrlSkeleton from './UrlSkeleton.js'

function getDevice() {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  return window.matchMedia('(max-width: 820px)').matches
    ? 'mobile'
    : 'desktop'
}

export default function UrlReport({ model, device = '', loading = false, presentation, }) {
  const resolvedDevice = device || getDevice()

  if (loading) {
    return (
      <UrlSkeleton
        mode={model.mode}
        device={resolvedDevice}
      />
    )
  }

  if (resolvedDevice === 'mobile') {
    return <UrlMobile model={model} presentation={presentation} />
  }

  return <UrlDesktop model={model} presentation={presentation} />
}
