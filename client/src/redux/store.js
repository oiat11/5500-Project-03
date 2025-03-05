import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './auth/authSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  // Add more reducers here as your app grows
})

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['auth'] // Only persist auth state
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true
})

export const persistor = persistStore(store)