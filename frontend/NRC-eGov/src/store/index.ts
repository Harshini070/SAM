// Minimal store scaffolding. Replace with Redux Toolkit or context-based store later.

import { createContext } from 'react';
import { User } from '../types';

type AppState = { user?: User | null };

const defaultState: AppState = { user: null };

export const AppStoreContext = createContext({
  state: defaultState,
  setState: (s: Partial<AppState>) => {},
});

// Example: integrate Redux Toolkit here with slices and configureStore
// export const store = configureStore({ reducer: { auth: authReducer } });

// TODO: wire up persistor (redux-persist) for offline sync and token storage
