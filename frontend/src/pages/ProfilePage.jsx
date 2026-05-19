import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDiverProfile, getAllDives } from "../api/diveApi"
import { Settings } from "lucide-react"
import "./ProfilePage.css"

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ totalDives: 0, maxDepth: 0, bottomTime: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profileRes, divesRes] = await Promise.all([getDiverProfile(), getAllDives()])
        setProfile(profileRes);
        
        const diveArray = Array.isArray(divesRes) ? divesRes : []
        
        if (diveArray.length > 0) {
          const totalTime = diveArray.reduce((acc, curr) => acc + (Number(curr.durationMinutes) || 0), 0)
          const deepPoint = Math.max(...diveArray.map(d => Number(d.depthMeters) || 0))
          setStats({
            totalDives: diveArray.length,
            maxDepth: deepPoint,
            bottomTime: totalTime
          })
        }
      } catch (err) {
        console.error("Failed to compile dashboard profile data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  function handleLogout() {
    localStorage.removeItem("user_session_token")
    navigate("/login", { replace: true })
  }

  if (loading) return <div className="dive-form-page"><div className="card"><h2>Loading Profile Node...</h2></div></div>

return (
  <div className="profile-page-container">
    <button className="back-dashboard-global-btn" onClick={() => navigate("/")}>
      ← Back to Dashboard
    </button>
    <button className="nav-settings-global-btn" onClick={() => navigate("/settings")}>
  <Settings size={16} /> Settings
</button>
    <div className="profile-card">
       <h2 className="diver-email">{profile?.email || "Diver Account"}</h2>
        <span className="badge-rank">Verified Deep Diver</span>
        
        <p className="profile-meta-detail">Status: Active </p>

        <hr className="divider-line"/>

        <div className="stats-dashboard-grid centering-wrapper">
          <div className="stat-node centered-node">
            <span className="stat-label">Logged Descents</span>
            <span className="stat-val">{stats.totalDives}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-action-btn">
          Terminate Session (Logout)
        </button>
      </div>
    </div>
  )
}