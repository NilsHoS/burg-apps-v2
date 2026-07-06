import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthProvider'
import { TOOLS } from './lib/toolRegistry'
import RoleGate from './components/RoleGate'
import RequireAuth from './components/RequireAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import GeenToegang from './pages/GeenToegang'
import ToolPlaceholder from './pages/ToolPlaceholder'
import './App.css'
import './pages.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { profile } = useAuth()
  const userRole = profile?.role

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RoleGate minimumRole="admin" userRole={userRole} fallback={<GeenToegang />}>
              <AdminPanel />
            </RoleGate>
          </RequireAuth>
        }
      />

      {TOOLS.map((tool) => (
        <Route
          key={tool.id}
          path={tool.path}
          element={
            <RequireAuth>
              <RoleGate
                minimumRole={tool.minimumRole}
                userRole={userRole}
                fallback={<GeenToegang />}
              >
                <ToolPlaceholder naam={tool.naam} />
              </RoleGate>
            </RequireAuth>
          }
        />
      ))}

      <Route
        path="*"
        element={
          <RequireAuth>
            <GeenToegang />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default App
