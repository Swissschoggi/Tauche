import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllDives } from "../api/diveApi"
import { TrendingUp, Activity, Award } from "lucide-react"
import { Settings } from "lucide-react"
import "./AnalyticsPage.css"

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [dives, setDives] = useState([])
  const [hoveredNode, setHoveredNode] = useState(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await getAllDives()
        
        const diveArray = Array.isArray(res) ? res : []
        
        const sorted = [...diveArray]
          .filter((d) => d.date && d.depthMeters)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          
        setDives(sorted)
      } catch (err) {
        console.error("Failed to compile log history parameters:", err)
      }
    }
    loadHistory()
  }, [])

  const maxDepth = dives.length ? Math.max(...dives.map((d) => Number(d.depthMeters))) : 0
  const avgDepth = dives.length ? (dives.reduce((sum, d) => sum + Number(d.depthMeters), 0) / dives.length).toFixed(1) : 0

  const width = 600
  const height = 220
  const paddingX = 50
  const paddingY = 30

  const ceilingMax = maxDepth > 0 ? maxDepth * 1.2 : 40
  const usableWidth = width - paddingX * 2
  const usableHeight = height - paddingY * 2

  const points = dives.map((dive, index) => {
    const x = paddingX + (dives.length > 1 ? (index / (dives.length - 1)) * usableWidth : usableWidth / 2)
    
    const y = (height - paddingY) - (Number(dive.depthMeters) / ceilingMax) * usableHeight
    
    return { x, y, ...dive }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")
  const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z` : ""

const isMetric = JSON.parse(localStorage.getItem("useMetric") ?? "true");

const formatDepth = (meters) => {
  if (!meters) return "—";
  if (isMetric) return `${meters} m`;
  return `${Math.round(meters * 3.28084)} ft`;
};

const formatTemp = (celsius) => {
  if (!celsius) return "—";
  if (isMetric) return `${celsius} °C`;
  return `${Math.round((celsius * 9) / 5 + 32)} °F`;
};

const formatPressure = (bar) => {
  if (!bar) return "—";
  if (isMetric) return `${bar} bar`;
  return `${Math.round(bar * 14.5038)} psi`;
};

const formatDuration = (mins) => {
  return mins ? `${mins} mins` : "—";
};

  return (
    <div className="analytics-page">
      <button className="back-dashboard-global-btn" onClick={() => navigate("/")}>
        ← Back to Dashboard
      </button>
      <button className="nav-settings-global-btn" onClick={() => navigate("/settings")}>
        <Settings size={16} /> Settings
      </button>
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>📊 Dive Analytics Overview</h2>
          <p>Chronological performance records and depth trend timelines</p>
        </div>

        <div className="stats-strip">
          <div className="stat-pill">
            <Activity size={18} />
            <div>
              <span className="pill-label">Total Logs</span>
              <span className="pill-val">{dives.length}</span>
            </div>
          </div>
          <div className="stat-pill">
            <TrendingUp size={18} />
            <div>
              <span className="pill-label">Max Depth</span>
              <span className="pill-val">{maxDepth}m</span>
            </div>
          </div>
          <div className="stat-pill">
            <Award size={18} />
            <div>
              <span className="pill-label">Avg Depth</span>
              <span className="pill-val">{avgDepth}m</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Depth Profiles Timeline</h3>
          
          {dives.length < 2 ? (
            <div className="empty-chart-state">
              <p>Log at least two chronological dive entries to generate timeline datasets.</p>
            </div>
          ) : (
            <div className="chart-canvas-wrapper">
              <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
                <g stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1">
                  <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} />
                  <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} />
                  <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} />
                </g>

                <path d={areaPath} fill="url(#analyticsAreaGrad)" />
                <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                <defs>
                  <linearGradient id="analyticsAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)" />
                    <stop offset="100%" stopColor="rgba(5, 10, 20, 0)" />
                  </linearGradient>
                </defs>

                {points.map((p, i) => (
                  <g
                    key={p.id || i}
                    className={`node-interactive ${hoveredNode?.id === p.id ? "active" : ""}`}
                    onMouseEnter={() => setHoveredNode(p)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => navigate(`/dives/${p.id}`)}
                  >
                    <circle cx={p.x} cy={p.y} r="5" className="node-anchor" />
                    <circle cx={p.x} cy={p.y} r="14" className="node-hitbox" />
                  </g>
                ))}
              </svg>

              {hoveredNode && (
                <div
                  className="chart-live-tooltip"
                  style={{
                    left: `${(hoveredNode.x / width) * 100}%`,
                    top: `${(hoveredNode.y / height) * 100}%`,
                  }}
                >
                  <div className="tooltip-title">🤿 {hoveredNode.diveTitle}</div>
                  <div className="tooltip-row">📍 {hoveredNode.location?.split(",")[0]}</div>
                  <div className="tooltip-meta">
                    <span>📅 {hoveredNode.date}</span>
                    <span className="highlight-depth">📉 {hoveredNode.depthMeters}m</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}