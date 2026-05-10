import { Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import ClaimPage from './pages/ClaimPage'
import AuditPage from './pages/AuditPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/claim" element={<ClaimPage />} />
      <Route path="/audit" element={<AuditPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
