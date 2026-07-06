// widget/src/widget.tsx

import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Auto-initialize widget
(function initWidget() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderWidget);
  } else {
    renderWidget();
  }

  function renderWidget() {
    const container = document.createElement('div');
    container.id = 'comvia-widget-root';
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
})();