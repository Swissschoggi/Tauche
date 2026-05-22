import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import DiveForm from "./pages/DiveFormPage"
import DiveInfo from "./pages/DiveInfo"
import MapPage from "./pages/MapPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage" 
import ProtectedRoute from "./components/ProtectedRoute"
import ProfilePage from "./pages/ProfilePage"
import SettingsPage from "./pages/SettingsPage"
import CertificationPage from "./pages/CertificationPage"
import EquipmentPage from "./pages/EquipmentPage"
import SharedDivePage from "./pages/SharedDivePage"
import ShareViewPage from "./pages/ShareViewPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/share/:token" element={<SharedDivePage />} />
        
        <Route path="/shared/dives/:token" element={<SharedDivePage />} />
        
        <Route path="/shared/:data" element={<ShareViewPage />} />

        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/new" element={<ProtectedRoute><DiveForm /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><DiveForm /></ProtectedRoute>} />
        <Route path="/dives/:id" element={<ProtectedRoute><DiveInfo /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/certification" element={<ProtectedRoute><CertificationPage /></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App