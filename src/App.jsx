import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/Layout.jsx'
import { Home } from './pages/Home.jsx'
import { Agents, AgentDetail } from './pages/Agents.jsx'
import { Weapons, WeaponDetail } from './pages/Weapons.jsx'
import { Skins, SkinDetail } from './pages/Skins.jsx'
import { Maps, MapDetail } from './pages/Maps.jsx'
import { Ranks } from './pages/Ranks.jsx'
import { BattlePass } from './pages/BattlePass.jsx'
import { Collection } from './pages/Collection.jsx'

// scroll to top whenever the route changes
function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <Layout>
      <ScrollReset />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/weapons" element={<Weapons />} />
        <Route path="/weapons/:id" element={<WeaponDetail />} />
        <Route path="/skins" element={<Skins />} />
        <Route path="/skins/:id" element={<SkinDetail />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/maps/:id" element={<MapDetail />} />
        <Route path="/ranks" element={<Ranks />} />
        <Route path="/battle-pass" element={<BattlePass />} />

        {/* generic gallery collections */}
        <Route path="/playercards" element={<Collection resourceKey="playercards" />} />
        <Route path="/sprays" element={<Collection resourceKey="sprays" />} />
        <Route path="/buddies" element={<Collection resourceKey="buddies" />} />
        <Route path="/bundles" element={<Collection resourceKey="bundles" />} />
        <Route path="/sprays_titles" element={<Collection resourceKey="sprays_titles" />} />
        <Route path="/gamemodes" element={<Collection resourceKey="gamemodes" />} />
        <Route path="/currencies" element={<Collection resourceKey="currencies" />} />
        <Route path="/gear" element={<Collection resourceKey="gear" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
