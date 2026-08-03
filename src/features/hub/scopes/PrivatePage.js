// src/features/hub/scopes/PrivatePage.js

import React from 'react'

import HubPage from '../ui/HubPage'
import { HUB_SCOPE } from './scope'

export default function PrivatePage() {
  return <HubPage scope={HUB_SCOPE.PRIVATE} />
}
