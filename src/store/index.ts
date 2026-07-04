import { configureStore } from '@reduxjs/toolkit'
import resumesReducer from './apps/resumes'
import scoringReducer from './apps/scoring'

export const store = configureStore({
  reducer: {
    resumes: resumesReducer,
    scoring: scoringReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export type RootState  = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
