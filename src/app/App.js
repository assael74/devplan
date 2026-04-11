import * as React from 'react'
import { GlobalStyles } from '@mui/joy'
import CssBaseline from '@mui/joy/CssBaseline'
import { CssVarsProvider } from '@mui/joy/styles'
import { BrowserRouter } from 'react-router-dom'

import { theme } from '../ui/theme'
import AppShell from '../ui/core/layout/AppShell'
import RtlCacheProvider from './RtlCacheProvider'
import { CoreDataProvider } from '../features/coreData/CoreDataProvider'

import { AuthProvider } from './AuthProvider'
import { NotificationsProvider } from './NotificationsProvider'

import { AppProviders } from './providers'
import AppRoutes from './routes/AppRoutes'
import SnackbarProvider from '../ui/core/feedback/snackbar/SnackbarProvider.js'
import SnackbarCenter from '../ui/core/feedback/snackbar/SnackbarCenter'
import LifecycleProvider from '../ui/domains/entityLifecycle/LifecycleProvider.js'
import CreateModalProvider from '../ui/forms/create/CreateModalProvider'

export default function App() {
  return (
    <>
      <GlobalStyles
        styles={{
          html: { height: '100%', direction: 'rtl', overflow: 'hidden', scrollbarWidth: 'none' },
          body: { height: '100%', margin: 0, padding: 0, direction: 'rtl', overflow: 'hidden', scrollbarWidth: 'none' },
          '#root': { height: '100%', overflow: 'hidden' },
          'html::-webkit-scrollbar, body::-webkit-scrollbar': { display: 'none' },
        }}
      />

      <RtlCacheProvider>
        <CssVarsProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <SnackbarCenter />
            <AppShell>
              <AppProviders>
                <CoreDataProvider>
                  <BrowserRouter>
                    <AuthProvider>
                      <NotificationsProvider>
                        <LifecycleProvider>
                          <CreateModalProvider>
                            <AppRoutes />
                          </CreateModalProvider>
                        </LifecycleProvider>
                      </NotificationsProvider>
                    </AuthProvider>
                  </BrowserRouter>
                </CoreDataProvider>
              </AppProviders>
            </AppShell>
          </SnackbarProvider>
        </CssVarsProvider>
      </RtlCacheProvider>
    </>
  )
}
