// Placeholder auth slice API for future Redux Toolkit integration.

export const initialAuthState = {
  user: null,
  tokens: null,
};

export const authActions = {
  setUser: (user: any) => ({ type: 'auth/setUser', payload: user }),
  clearUser: () => ({ type: 'auth/clearUser' }),
};

export const authReducer = (state = initialAuthState, action: any) => {
  switch (action.type) {
    case 'auth/setUser':
      return { ...state, user: action.payload };
    case 'auth/clearUser':
      return { ...state, user: null, tokens: null };
    default:
      return state;
  }
};

// Notes:
// - Replace with createSlice from @reduxjs/toolkit when adding RTK.
// - Add thunks for async login/logout and token refresh.
