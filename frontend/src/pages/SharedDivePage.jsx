import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getSharedDive } from "../api/diveApi"
import { Calendar, MapPin, ArrowDown, Timer, Eye, User } from "lucide-react"
import "./DiveInfo.css"

export default function SharedDivePage() {
  const { token } = useParams()
  const [dive, setDive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadSharedDive() {
      try {
        const data = await getSharedDive(token)
        setDive(data)
      } catch (err) {
        setError("This dive log is not available or has been removed.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSharedDive()
  }, [token])

  if (loading) {
    return (
      <div className="dive-detail-page" style={{ textAlign: "center", paddingTop: "120px" }}>
        <p>Loading shared dive log...</p>
      </div>
    )
  }

  if (error || !dive) {
    return (
      <div className="dive-detail-page" style={{ textAlign: "center", paddingTop: "120px" }}>
        <div className="info-card" style={{ maxWidth: "400px", margin: "0 auto" }}>
          <h3>🔒 Dive Log Not Found</h3>
          <p>{error || "This shared dive log doesn't exist or has been removed."}</p>
          <Link to="/" style={{ color: "#38bdf8", textDecoration: "none" }}>
            ← Back to Tauche
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dive-detail-page">
      <div className="shared-banner" style={{
        background: "rgba(56, 189, 248, 0.1)",
        borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
        padding: "12px 20px",
        marginBottom: "24px",
        borderRadius: "12px",
        textAlign: "center",
        fontSize: "13px"
      }}>
        🔗 View-Only Shared Dive Log • 
        <Link to="/" style={{ color: "#38bdf8", marginLeft: "8px" }}>Sign in to your own logbook →</Link>
      </div>

      <div className="dive-hero">
        <img 
          src={dive.imagePath || "https://placehold.co/600x400?text=Dive"} 
          alt="Dive view" 
        />
        <div className="hero-overlay">
          <h1>{dive.diveTitle || "Shared Dive Log"}</h1>
          <p><MapPin size={14} style={{ display: "inline", marginRight: "6px" }} /> {dive.location || "Unknown Coordinates"}</p>
        </div>
      </div>

      <div className="dive-grid-info">
        <div className="info-card">
          <h3>Core Dive</h3>
          <div className="info-row">
            <div className="info-row-left"><Calendar size={16} /><span className="label">Date:</span></div>
            <span className="value">{dive.date || "—"}</span>
          </div>
          <div className="info-row">
            <div className="info-row-left"><MapPin size={16} /><span className="label">Location:</span></div>
            <span className="value">{dive.location || "—"}</span>
          </div>
          <div className="info-row">
            <div className="info-row-left"><ArrowDown size={16} /><span className="label">Depth:</span></div>
            <span className="value">{dive.depthMeters ? `${dive.depthMeters}m` : "—"}</span>
          </div>
          <div className="info-row">
            <div className="info-row-left"><Timer size={16} /><span className="label">Duration:</span></div>
            <span className="value">{dive.durationMinutes ? `${dive.durationMinutes} mins` : "—"}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>Conditions</h3>
          <div className="info-row">
            <div className="info-row-left"><Eye size={16} /><span className="label">Visibility:</span></div>
            <span className="value">{dive.visibilityMeters ? `${dive.visibilityMeters}m` : "—"}</span>
          </div>
          <div className="info-row">
            <div className="info-row-left"><Timer size={16} /><span className="label">Water Temp:</span></div>
            <span className="value">{dive.waterTemperatureCelsius ? `${dive.waterTemperatureCelsius}°C` : "—"}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>Equipment & People</h3>
          <div className="info-row">
            <div className="info-row-left"><User size={16} /><span className="label">Buddy:</span></div>
            <span className="value">{dive.buddy || "—"}</span>
          </div>
          <div className="info-row">
            <div className="info-row-left"><span className="label">Gas:</span></div>
            <span className="value">{dive.gas || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}