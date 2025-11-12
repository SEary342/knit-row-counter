import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import { store } from './app/store'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.ROUTER_BASENAME}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
