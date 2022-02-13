import React, {useEffect} from 'react'

export const TheContext = React.createContext({undefined})

let intervalClock

/* 
reducer is supposed to be a pure function that only modifies state with no
additional side effect. However, we need side effects to happen when the client
toggles the interval timer. To take care of that, we introduce a new state attribute
called `toggling` that is set to `true` when the client calls  `toggleInterval` and 
set to `false` after the side effects have happened. The side-effects themselves go into
a `useEffect` that depends on the state of `toggling`.
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE':
      return {
        ...state,
        toggling: true, //Allow side effects to happen
      };
    
    case 'TOGGLE_SUCCESS':   
      return {
        ...state,
        toggling: false, 
        running: ! state.running //Adjust state after side effects are done
      }
    case 'INCREMENT':
      return {
        ...state,
        intervalCount: state.intervalCount + 1,
      };
    default:
      return state;
  }
};

export function TheProvider({ children }){
  const initState = {
    intervalCount: 0,
    running: false,
    toggling: false,
  }
  const [state, dispatch] = React.useReducer(reducer, initState)

  useEffect( () => {
    if (state.toggling) {
      if (state.running) {
        intervalClock && clearInterval(intervalClock)
      } else {
        intervalClock = setInterval(advanceInterval, 1000)
      } 
      dispatch({type: `TOGGLE_SUCCESS`})
    }
  }, [state.toggling, state.running])

  /* advanceInterval probably doesn't need to be a function here.
     We keep it here for now to match the non-reducer code a bit more
     closely
  */
  function advanceInterval() {
    dispatch({type: `INCREMENT`})
  }

  function toggleInterval() {
    dispatch({type: `TOGGLE`})
  }

  /* 
  Note that the `toggling` state attribue is purely for internal use
  so we don't need to expose it to the consumer 
  */
  const contextState = { 
    intervalCount: state.intervalCount, 
    running: state.running
  }

  return <TheContext.Provider value={{
    state: contextState,
    toggleInterval,
  }}>{children}</TheContext.Provider>
}