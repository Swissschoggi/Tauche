import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllDives, deleteDive } from "../api/diveApi"
import "./HomePage.css"
export default function HomePage() {
  const [dives, setDives] = useState([])
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

  return (
    <div className="dive-list-page">
      <div className="header">
        <h1>Dive Log</h1>

        <button onClick={() => navigate("/new")}>
          + New Dive
        </button>
      </div>

      <div className="dive-grid">
        {dives.map((dive) => (
            <div
            key={dive.id}
            className="dive-card"
            onClick={() => navigate(`/dives/${dive.id}`)}
            >
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

                <p className="location">
                {dive.location}
                </p>

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