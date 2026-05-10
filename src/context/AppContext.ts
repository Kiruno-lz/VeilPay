import { createContext } from 'react';
import type { AppState, AppAction } from '../types';

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextType | null>(null);
