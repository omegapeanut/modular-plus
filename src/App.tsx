import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Tasks from './pages/Tasks'
import Learning from './pages/Learning'
import Schedule from './pages/Schedule'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/schedule" element={<Schedule />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
