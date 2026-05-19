import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllDives, deleteDive } from "../api/diveApi"
import { BarChart3, Map, Plus, User } from "lucide-react"
import { Settings } from "lucide-react"
import "./HomePage.css"

export default function HomePage() {
  const navigate = useNavigate()
  const [dives, setDives] = useState([])
  const [selectedIds, setSelectedIds] = useState([])

useEffect(() => {
    async function load() {
      try {
        const res = await getAllDives()
        if (res) {
          setDives(res)
        }
      } catch (err) {
        console.error("Failed loading data dashboard entries:", err)
      }
    }
    load()
  }, [])
  function toggleSelectCard(id, e) {
    e.stopPropagation()
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  async function handleDeleteSelected() {
    if (!window.confirm(`Delete ${selectedIds.length} logged entries?`)) return
    try {
      await Promise.all(selectedIds.map(id => deleteDive(id)))
      setDives(prev => prev.filter(d => !selectedIds.includes(d.id)))
      setSelectedIds([])
    } catch (err) {
      console.error("Deletion queue failure:", err)
    }
  }

  return (
    <div className="dive-list-page">
      <div className="header">
        <h1>Tauche</h1>
        
        <div className="header-actions">
          {selectedIds.length > 0 && (
            <button className="btn-danger" onClick={handleDeleteSelected}>
              Delete ({selectedIds.length})
            </button>
          )}
          
          <button className="btn-secondary" onClick={() => navigate("/analytics")}>
            <BarChart3 size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Analytics
          </button>
            <button className="nav-settings-global-btn" onClick={() => navigate("/settings")}>
              <Settings size={16} /> Settings
            </button>
          <button className="btn-secondary" onClick={() => navigate("/map")}>
            <Map size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Globe View
          </button>
          
          <button onClick={() => navigate("/new")}>
            <Plus size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            New Log
          </button>

          <button className="btn-secondary" onClick={() => navigate("/profile")} title="View Profile">
            <User size={16} />
          </button>
        </div>
      </div>

      {dives.length === 0 ? (
        <div className="empty-state">
          <p>No dives recorded yet. Click 'New Log' to add your first underwater trip.</p>
        </div>
      ) : (
        <div className="dive-grid">
          {dives.map(d => {
            const isChecked = selectedIds.includes(d.id)
            return (
              <div
                key={d.id}
                className={`dive-card ${isChecked ? "selected" : ""}`}
                onClick={() => navigate(`/dives/${d.id}`)}
              >
                <div
                  className={`checkbox ${isChecked ? "checked" : ""}`}
                  onClick={(e) => toggleSelectCard(d.id, e)}
                >
                  {isChecked && "✓"}
                </div>
                
                <div className="dive-image-wrapper">
                  <img
                    className="dive-image"
                    src={d.imagePath ? `${window.location.protocol}//${window.location.hostname}:8989${d.imagePath}` : "https://placehold.co/600x400?text=Dive"}                    alt={d.diveTitle}
                  />
                </div>
                
                <div className="dive-info">
                  <h3>{d.diveTitle || "Untitled Expedition"}</h3>
                  <p className="location">📍 {d.location || "Unknown Coordinates"}</p>
                  <div className="dive-tags">
                    {d.depthMeters && <span>{d.depthMeters}m</span>}
                    {d.durationMinutes && <span>⏱ {d.durationMinutes} min</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}