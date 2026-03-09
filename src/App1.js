import * as React from 'react';
import { createRoot } from "react-dom/client";
import { GlobalStyles } from '@mui/joy';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AuthContextProvider from './newComponnents/AuthContext.js'
import AllNewLayouts from './newComponnents/AllNewLayouts.js'
import { SnackbarProvider } from './newComponnents/h_componnetsUtils/SnackBar/SnackbarProvider.js';


export default function App() {
  return (
    <>
      <GlobalStyles
        styles={{
          html: { height: '100%', overflow: 'hidden' },
          body: { height: '100%', margin: 0, padding: 0, overflow: 'hidden' },
          '#root': { height: '100%' },
        }}
      />
      <AuthContextProvider>
        <BrowserRouter>
          <SnackbarProvider>
            <AllNewLayouts />
          </SnackbarProvider>
        </BrowserRouter>
      </AuthContextProvider>
    </>
  );
}
