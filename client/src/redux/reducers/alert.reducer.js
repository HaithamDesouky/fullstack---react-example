import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

//this is the reducer that adds the payload to the state

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      return state.filter(alert => alert.id !== payload);
    default:
      return state;
  }
}
