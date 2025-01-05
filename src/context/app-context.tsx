import { createContext, useReducer, ReactNode } from 'react';

interface AppState {
  openSidenav: boolean;
  mobileSidenav: boolean;
}

interface AppAction {
  type: 'SET_OPEN_SIDENAV' | 'SET_MOBILE_SIDENAV';
  payload: boolean;
}

const initialState: AppState = {
  openSidenav: true,
  mobileSidenav: false,
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => null });

export const setOpenSidenav = (value: boolean): AppAction => ({
  type: 'SET_OPEN_SIDENAV',
  payload: value,
});

export const setMobileSidenav = (value: boolean): AppAction => ({
  type: 'SET_MOBILE_SIDENAV',
  payload: value,
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_OPEN_SIDENAV':
      return { ...state, openSidenav: action.payload };
    case 'SET_MOBILE_SIDENAV':
      return { ...state, mobileSidenav: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}; 