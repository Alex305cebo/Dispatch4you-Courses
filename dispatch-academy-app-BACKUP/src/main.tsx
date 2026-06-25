import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const App = React.lazy(() => import('./App'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Загрузка...</div>}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
)
