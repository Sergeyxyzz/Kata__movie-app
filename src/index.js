import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app/App'
import Context from './components/context/Context'

const root = createRoot(document.getElementById('root'))
root.render(
  <Context>
    <App />
  </Context>,
)
