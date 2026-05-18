import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllDives, deleteDive } from "../api/diveApi"
import "./HomePage.css"

export default function HomePage() {
  const [dives, setDives] = useState([])
  const [selected, setSelected] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadDives()
  }, [])

  async function loadDives() {
    try {
      const res = await getAllDives()
      setDives(res.data || [])
    } catch (err) {
      console.error(err)
      setDives([])
    }
  }

  async function handleDelete(id) {
    await deleteDive(id)
    loadDives()
  }

  async function handleDeleteSelected() {
    if (!window.confirm(`Delete ${selected.length} dive(s)?`)) return
    await Promise.all(selected.map((id) => deleteDive(id)))
    setSelected([])
    setSelectMode(false)
    loadDives()
  }

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function handleCardClick(dive) {
    if (selectMode) {
      toggleSelect(dive.id)
    } else {
      navigate(`/dives/${dive.id}`)
    }
  }

  return (
    <div className="dive-list-page">
      <div className="header">
        <h1>Dive Log</h1>
        <div className="header-actions">
          {selectMode ? (
            <>
              <button
                className="btn-danger"
                onClick={handleDeleteSelected}
                disabled={selected.length === 0}
              >
                Delete ({selected.length})
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectMode(false)
                  setSelected([])
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-secondary"
                onClick={() => setSelectMode(true)}
              >
                Select
              </button>
              <button onClick={() => navigate("/new")}>+ New Dive</button>
            </>
          )}
        </div>
      </div>

      <div className="dive-grid">
        {dives.map((dive) => (
          <div
            key={dive.id}
            className={`dive-card ${selected.includes(dive.id) ? "selected" : ""}`}
            onClick={() => handleCardClick(dive)}
          >
            {selectMode && (
              <div className={`checkbox ${selected.includes(dive.id) ? "checked" : ""}`}>
                {selected.includes(dive.id) ? "✓" : ""}
              </div>
            )}
            <div className="dive-image-wrapper">
              <img
                className="dive-image"
                src={
                  dive.imagePath
                    ? `http://localhost:8080${dive.imagePath}`
                    : "https://placehold.co/600x400?text=Dive"
                }
                alt={dive.diveTitle}
              />
            </div>
            <div className="dive-info">
              <h3>{dive.diveTitle}</h3>
              <p className="location">{dive.location}</p>
              <div className="dive-tags">
                <span>{dive.depthMeters}m</span>
                <span>{dive.durationMinutes} min</span>
                <span>{dive.diveType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}