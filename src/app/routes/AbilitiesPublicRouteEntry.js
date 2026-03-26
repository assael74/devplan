import React from 'react'
import { useParams } from 'react-router-dom'
import AbilitiesPublicRoutePage from '../../features/abilitiesPublic/page/AbilitiesPublicRoutePage.js'

export default function AbilitiesPublicRouteEntry() {
  const { token } = useParams()

  return <AbilitiesPublicRoutePage token={token} />
}
