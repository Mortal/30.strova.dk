import React from 'react'
import './index.css'

Promise.all([import("react-dom/client"), import("./App.tsx")])
  .then(async ([{ default: ReactDOM }, { default: App }]) => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
