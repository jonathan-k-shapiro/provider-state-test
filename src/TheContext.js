import React, {useEffect} from 'react'

export const TheContext = React.createContext({undefined})

let intervalClock

/*
In this version, TheProvider maintains individual state variables
with `useState` and exposes these plus some helper methods to 
the consumer
*/
export function TheProvider({ children }) {
  const [intervalCount, setIntervalCount] = React.useState(0)
  const [running, setRunning] = React.useState(false)

function toggleInterval() {
    if (running) {
      intervalClock && clearInterval(intervalClock)  // <== Side effect
      setRunning(false)
    } else {
      intervalClock = setInterval(advanceInterval, 1000) // <== Side effect
      setRunning(true)
    }

  }

  function advanceInterval() {
    setIntervalCount(currentCount => currentCount + 1);  //<== Functional form of setState prevents stale closure
    // setIntervalCount(intervalCount + 1)  // <== This version creates a stale closure
  }

  
  // Expose state variables to the consumer
  const contextState = { intervalCount, running }

  return <TheContext.Provider value={{
    state: contextState,
    toggleInterval, 
  }}>{children}</TheContext.Provider>
}