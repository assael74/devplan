// src/features/players/components/preview/PreviewDomainCard/PreviewDomainCardBody.js
import React, { useMemo } from 'react'
import { getDomainDef } from './domainRegistry'
import { getEntityKind } from './utils/getEntityKind'

export default function PreviewDomainCardBody({ d, entity, context }) {
  const def = useMemo(() => {
    if (!d?.key) return null
    const entityKind = getEntityKind(entity)
    return getDomainDef(entityKind, d.key)
  }, [d?.key, entity])

  const Summary = def?.Summary
  if (!Summary) return null

  return <Summary entity={entity} d={d} context={context} />
}
