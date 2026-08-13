import { useState } from 'react'
import CentrosList from './components/CentrosList'
import SipapList from './components/SipapList'
import FavoritosView from './components/FavoritosView'
import './App.css'

const TABS = {
  centros: { label: 'Centros', component: CentrosList },
  sipap: { label: 'SIPAP', component: SipapList },
  favoritos: { label: 'Favoritos', component: FavoritosView },
}

function App() {
  const [tab, setTab] = useState('centros')
  const ActiveView = TABS[tab].component

  return (
    <main className="app">
      <nav className="tabs">
        {Object.entries(TABS).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            className={key === tab ? 'tab active' : 'tab'}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="view">
        <ActiveView />
      </section>
    </main>
  )
}

export default App
