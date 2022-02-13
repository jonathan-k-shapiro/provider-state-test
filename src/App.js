import logo from './logo.svg';
import './App.css';
import React, { useContext, useEffect } from 'react'
import TheProvider , { TheContext } from './TheContext'


const styles = {
  dark: {backgroundColor: 'lightCoral', color: 'black'},
  light: {backgroundColor: 'lightGreen', color: 'black'},
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

  useEffect(() => {
    function handleSpaceBarPress(event: any) {
      if (
        event.keyCode === 32 &&
        event.target.tagName !== 'INPUT' 
      ) {
        provider.toggleInterval()
      }
    }
    window.addEventListener('keypress', handleSpaceBarPress)
    return () => window.removeEventListener('keypress', handleSpaceBarPress)
  }, [provider.state  ])

  return (
    <div>
      <button 
        onClick={() => provider.toggleInterval()}
        style={provider.state.running ? styles.dark : styles.light} 
      >
        <p>{provider.state.intervalCount}</p>
      </button>
    </div>
  );
}