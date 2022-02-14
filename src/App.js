import logo from './logo.svg';
import './App.css';
import React, { useContext, useEffect } from 'react'
import { TheProvider ,TheContext } from './TheContext'


const styles = {
  running: {backgroundColor: 'lightCoral', color: 'black'},
  paused: {backgroundColor: 'lightGreen', color: 'black'},
}


export default function App() {
  return (
    <TheProvider>
      <Toolbar />
    </TheProvider>
  );
}


function Toolbar(props) {
  const provider = useContext(TheContext)

  /*
  In the non-reducer version of this example, we need to protect against
  a stale closure when installing the keypress event listener. We do this
  by explicitly depending on `provider.state`. The effect is that every time
  provider state changes, we tear down and re-install the event listener.
  More troubling, however. is the need for the consumer to maintain a dependency
  on the provider state, which creates a leaky abstraction.
  */
  useEffect(() => {
    function handleSpaceBarPress(event) {
      console.log(event)
      if (
        event.code === 'Space' 
      ) {
        event.preventDefault()
        provider.toggleInterval()
      }
    }
    window.addEventListener('keydown', handleSpaceBarPress)
    return () => window.removeEventListener('keydown', handleSpaceBarPress)
  }, [provider.state ]) // To prevent stale closure, this useEffect needs to depend on provider state

  return (
    <div>
      <button 
        onClick={() => provider.toggleInterval()}
        style={provider.state.running ? styles.running : styles.paused} 
      >
        <p>{provider.state.intervalCount}</p>
      </button>
    </div>
  );
}