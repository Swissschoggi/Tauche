import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllDives, deleteDive, getImageUrl } from "../api/diveApi"
import { BarChart3, Map, Plus, User, Settings, Award, Wrench, Trash2, Star } from "lucide-react"
import { useFavorites } from '../hooks/useFavorites'
import "./HomePage.css"

export default function HomePage() {
  const navigate = useNavigate()
  const [dives, setDives] = useState([])
  const [diveImages, setDiveImages] = useState({})
  const [selectedIds, setSelectedIds] = useState([])
  
  const { favoriteSites, toggleFavoriteSite } = useFavorites()

  useEffect(() => {
    async function load() {
      try {
        const res = await getAllDives()
        if (res) {
          setDives(res)
          const imageMap = {}
          await Promise.all(
            res.map(async (d) => {
              if (d.imagePath) {
                imageMap[d.id] = await getImageUrl(d.imagePath)
              }
            })
          )
          setDiveImages(imageMap)
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

  async function handleDeleteSingle(id, diveTitle, e) {
    e.stopPropagation()
    if (!window.confirm(`Delete dive "${diveTitle || "Untitled"}"?`)) return
    try {
      await deleteDive(id)
      setDives(prev => prev.filter(d => d.id !== id))
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    } catch (err) {
      console.error("Failed to delete dive:", err)
      alert("Failed to delete dive. Please try again.")
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

          <button className="btn-primary-action" onClick={() => navigate("/new")}>
            <Plus size={16} />
            New Log
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/analytics")}>
            <BarChart3 size={16} />
            Analytics
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/map")}>
            <Map size={16} />
            Globe View
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/equipment")}>
            <Wrench size={16} />
            Equipment
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/certification")}>
            <Award size={16} />
            Certificates
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/settings")} title="Settings">
            <Settings size={16} />
          </button>

          <button className="btn-dashboard-nav profile-btn" onClick={() => navigate("/profile")} title="View Profile">
            <User size={16} />
          </button>
        </div>
      </div>

      {favoriteSites.length > 0 && (
        <div className="favorites-filter-bar" style={{ 
          marginBottom: '24px', 
          padding: '12px 16px',
          background: 'rgba(17, 24, 39, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <Star size={16} fill="#fbbf24" color="#fbbf24" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#fbbf24' }}>Favorite Sites:</span>
          {favoriteSites.map(site => (
            <span
              key={site}
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#94a3b8'
              }}
            >
              {site.split(',')[0]}
            </span>
          ))}
        </div>
      )}

      {dives.length === 0 ? (
        <div className="empty-state">
          <p>No dives recorded yet. Click 'New Log' to add your first underwater trip.</p>
        </div>
      ) : (
        <div className="dive-grid">
          {dives.map(d => {
            const isChecked = selectedIds.includes(d.id)
            const isFavorite = d.location && favoriteSites.includes(d.location)
            
            return (
              <div
                key={d.id}
                className={`dive-card ${isChecked ? "selected" : ""}`}
                onClick={() => navigate(`/dives/${d.id}`)}
                style={isFavorite ? { borderLeft: '3px solid #fbbf24' } : {}}
              >
                <div className="dive-card-actions">
                  <div
                    className={`checkbox ${isChecked ? "checked" : ""}`}
                    onClick={(e) => toggleSelectCard(d.id, e)}
                  >
                    {isChecked && "✓"}
                  </div>
                  <button
                    className="delete-single-btn"
                    onClick={(e) => handleDeleteSingle(d.id, d.diveTitle, e)}
                    title="Delete dive"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="dive-image-wrapper">
                  <img
                    className="dive-image"
                    src={diveImages[d.id] || "https://placehold.co/600x400?text=Dive"}
                    alt={d.diveTitle}
                  />
                </div>

                <div className="dive-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{d.diveTitle || "Untitled Expedition"}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavoriteSite(d.location)
                      }}
                      style={{ 
                        background: 'transparent', 
                        padding: '4px',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Star 
                        size={18} 
                        fill={isFavorite ? '#fbbf24' : 'none'}
                        color="#fbbf24"
                      />
                    </button>
                  </div>
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