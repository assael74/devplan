import React from 'react'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import rtlPlugin from 'stylis-plugin-rtl'

const cacheRtl = createCache({
  key: 'mui-rtl',
  stylisPlugins: [rtlPlugin],
})

export default function RtlCacheProvider({ children }) {
  return <CacheProvider value={cacheRtl}>{children}</CacheProvider>
}
