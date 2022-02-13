import React, {useEffect} from 'react'

export const TheContext = React.createContext({undefined})

let intervalClock

export default ({ children }) => {
  const [intervalCount, setIntervalCount] = React.useState(0)
  const [running, setRunning] = React.useState(false)

function toggleInterval() {
    if (running) {
      intervalClock && clearInterval(intervalClock)
      setRunning(false)
    } else {
      intervalClock = setInterval(advanceInterval, 1000)
      setRunning(true)
    }

  }

  function advanceInterval() {
    console.log('interval count', intervalCount);
    setIntervalCount(currentCount => currentCount + 1);  
    // setIntervalCount(intervalCount + 1)
  }

  
  const contextState = { intervalCount, running }

  return <TheContext.Provider value={{
    state: contextState,
    toggleInterval,
  }}>{children}</TheContext.Provider>
}