import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

const iniState = {
  user: null
};

export const actionTypes = {
  UPDATE_USER: 'UPDATE_USER'
};

// REDUCERS
export const reducer = (state = iniState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_USER:
      return Object.assign({}, state, {
        user: action.user
      });
    default: return state;
  }
};

// ACTIONS
export const startSession = (isServer, res) => (dispatch) => {
  if (isServer && res.state && res.state.user) {
    dispatch({
      type: actionTypes.UPDATE_USER,
      user: res.state.user
    });
  }
};

export const setUser = user => dispatch => dispatch({ type: actionTypes.UPDATE_USER, user });

export function initializeStore(initialState = iniState) {
  return createStore(reducer, initialState, composeWithDevTools(applyMiddleware(thunkMiddleware)));
}
