// src/application/actions/entities/useCreateRequest.js

import { useCallback, useRef } from 'react'
import isEqual from 'lodash/isEqual'
import { makeId } from '../../../utils/id.js'

export function useCreateRequest() {
  const attempt = useRef(null)

  const getCreateRequest = useCallback(input => {
    if (attempt.current && isEqual(attempt.current.input, input)) {
      return attempt.current.request
    }

    const request = { id: makeId(), startedAt: Date.now() }
    attempt.current = { input, request }
    return request
  }, [])

  const clearCreateRequest = useCallback(() => {
    attempt.current = null
  }, [])

  return { getCreateRequest, clearCreateRequest }
}
