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

  /* In the reducer version of this example, we don't need to protect
  against a stale closure when installing the keypress event listener. */
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
  }, [])  //Note: empty dependency array works here. Only install handler on first render.

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