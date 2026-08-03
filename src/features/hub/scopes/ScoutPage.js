// src/features/hub/scopes/ScoutPage.js

import React from 'react'

import HubPage from '../ui/HubPage'
import { HUB_SCOPE } from './scope'

export default function ScoutPage() {
  return <HubPage scope={HUB_SCOPE.SCOUT} />
}
