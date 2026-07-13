import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllDives, deleteDive, getImageUrl } from "../api/diveApi"
import { BarChart3, Map, Plus, User, Settings, Award, Wrench, Trash2, Star, MapPin, TowerControl, Waves } from "lucide-react"
import { useFavorites } from '../hooks/useFavorites'
import SkeletonCard from '../components/SkeletonCard'
import DiveCalendar from '../components/DiveCalendar'
import BubbleBackground from '../components/BubbleBackground'
import DiveBadges from '../components/DiveBadges'
import "./HomePage.css"

export default function HomePage() {
  const navigate = useNavigate()
  const [dives, setDives] = useState([])
  const [diveImages, setDiveImages] = useState({})
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)
  
  const { favoriteSites, toggleFavoriteSite } = useFavorites()

  useEffect(() => {
    async function load() {
      setLoading(true) 
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
      } finally {
        setLoading(false) 
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
    <>
      <BubbleBackground />
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
            <Plus size={18} />
            New Log
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/sites")}>
            <MapPin size={20} />
            Sites
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/trips")}>
            <TowerControl size={20} />
            Trips
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/analytics")}>
            <BarChart3 size={20} />
            Analytics
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/map")}>
            <Map size={20} />
            Globe
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/equipment")}>
            <Wrench size={20} />
            Gear
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/certification")}>
            <Award size={20} />
            Certs
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/settings")} title="Settings">
            <Settings size={20} />
          </button>

          <button className="btn-dashboard-nav" onClick={() => navigate("/profile")} title="View Profile">
            <User size={20} />
          </button>
        </div>
      </div>

      {favoriteSites.length > 0 && (
        <div className="favorites-filter-bar">
          <span className="favorites-filter-bar-label">
            <Star size={16} fill="#fbbf24" color="#fbbf24" />
            Favorite Sites:
          </span>
          {favoriteSites.map(site => (
            <span key={site} className="favorites-filter-bar-site">
              {site.split(',')[0]}
            </span>
          ))}
        </div>
      )}

      <DiveCalendar dives={dives} />

      {!loading && dives.length > 0 && (
        <DiveBadges dives={dives} favoriteSites={favoriteSites} />
      )}

      {loading ? (
        <div className="dive-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : dives.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Waves size={48} strokeWidth={1.5} />
          </div>
          <p>No dives recorded yet. Click <strong>New Log</strong> to add your first underwater adventure.</p>
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
    </>
  )
}