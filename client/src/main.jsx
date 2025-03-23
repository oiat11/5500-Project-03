import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './redux/store.js'
import { ToastProvider } from './components/ui/toast.jsx'
import axios from 'axios'

// Configure axios to include credentials in all requests
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </PersistGate>
  </Provider>,
)
