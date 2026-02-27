import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'

const params = new URLSearchParams(window.location.search)
const redirectedPath = params.get('p')
if (redirectedPath) {
  const cleanedPath = decodeURIComponent(redirectedPath)
  window.history.replaceState(null, '', cleanedPath)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
      <Provider store={store}>
      <App />
      </Provider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
)
