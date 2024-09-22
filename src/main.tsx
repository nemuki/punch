import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Layout } from './Layout.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

const theme = createTheme({
  fontFamily:
    'Helvetica Neue,' +
    'Arial,' +
    'Hiragino Kaku Gothic ProN,' +
    'Hiragino Sans,' +
    'Meiryo, sans-serif',
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <AuthProvider>
        <Layout>
          <App />
        </Layout>
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>,
)
