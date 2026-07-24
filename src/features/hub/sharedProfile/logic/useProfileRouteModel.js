// src/features/hub/sharedProfile/logic/useProfileRouteModel.js

import { useMemo } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  resolveProfileRawTab,
  resolveProfileSelectedTab,
} from './profileModel.shared.js'

export default function useProfileRouteModel({ resolveTab }) {
  const location = useLocation()
  const params = useParams()
  const [searchParams] = useSearchParams()

  const rawTab = useMemo(() => {
    return resolveProfileRawTab({
      tabKey: params.tabKey,
      searchParams,
    })
  }, [params.tabKey, searchParams])

  const tab = useMemo(() => {
    return resolveTab({
      tabKeyParam: params.tabKey,
      searchParams,
      params,
    })
  }, [resolveTab, params, searchParams])

  const selectedTab = useMemo(() => {
    return resolveProfileSelectedTab({
      rawTab,
      tab,
    })
  }, [rawTab, tab])

  return {
    location,
    params,
    searchParams,
    rawTab,
    tab,
    selectedTab,
  }
}
