// src/App.tsx

import React, { useEffect } from 'react';
import './App.css';
import { Widget } from './components/widget/Widget';

function App() {
  // Load widget settings from URL or localStorage
  useEffect(() => {
    // Check if we have settings in URL params
    const params = new URLSearchParams(window.location.search);
    const settingsParam = params.get('settings');
    
    if (settingsParam) {
      try {
        const settings = JSON.parse(decodeURIComponent(settingsParam));
        (window as any).comviaSettings = settings;
      } catch (e) {
        console.error('Failed to parse widget settings:', e);
      }
    }

    console.log('Comvia Widget v1.0.0 loaded');
  }, []);

  return (
    <div className="App">
      <Widget />
    </div>
  );
}

export default App;