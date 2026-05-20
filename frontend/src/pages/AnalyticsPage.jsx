import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllDives } from "../api/diveApi"
import { calculateSAC } from "../components/diveCalculations"
import { TrendingUp, Activity, Settings, Droplets } from "lucide-react"
import "./AnalyticsPage.css"

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [dives, setDives] = useState([])
  const [hoveredNode, setHoveredNode] = useState(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await getAllDives()
        const sorted = [...(Array.isArray(res) ? res : [])]
          .filter((d) => d.date && d.depthMeters)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
        setDives(sorted)
      } catch (err) {
        console.error("Failed to load history:", err)
      }
    }
    loadHistory()
  }, [])

  const maxDepth = dives.length ? Math.max(...dives.map((d) => Number(d.depthMeters))) : 0
  const avgDepth = dives.length ? (dives.reduce((sum, d) => sum + Number(d.depthMeters), 0) / dives.length).toFixed(1) : 0

  const validSacValues = dives
    .map((d) => parseFloat(calculateSAC(d)))
    .filter((sac) => !isNaN(sac) && sac > 0)

  const avgSacRate = validSacValues.length
    ? (validSacValues.reduce((sum, val) => sum + val, 0) / validSacValues.length).toFixed(2)
    : "N/A"

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

  return (
    <div className="analytics-page">
      <button className="back-dashboard-global-btn" onClick={() => navigate("/")}>← Back to Dashboard</button>
      <button className="nav-settings-global-btn" onClick={() => navigate("/settings")}><Settings size={16} /> Settings</button>
      
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>📊 Dive Analytics Overview</h2>
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
            <TrendingUp size={18} /> 
            <div>
              <span className="pill-label">Avg Depth</span>
              <span className="pill-val">{avgDepth}m</span>
            </div>
          </div>
          <div className="stat-pill highlight-sac-pill">
            <Droplets size={18} style={{ color: "#38bdf8" }} /> 
            <div>
              <span className="pill-label">Avg SAC Rate</span>
              <span className="pill-val" style={{ color: "#38bdf8" }}>{avgSacRate} {avgSacRate !== "N/A" ? "bar/min" : ""}</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Depth Profiles Timeline</h3>
          {dives.length < 2 ? (
            <div className="empty-chart-state"><p>Log at least two dives to generate timeline datasets.</p></div>
          ) : (
            <div className="chart-canvas-wrapper">
              <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
                <path d={areaPath} fill="url(#analyticsAreaGrad)" />
                <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="analyticsAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)" />
                    <stop offset="100%" stopColor="rgba(5, 10, 20, 0)" />
                  </linearGradient>
                </defs>
                {points.map((p, i) => (
                  <g key={p.id || i} className="node-interactive" onMouseEnter={() => setHoveredNode(p)} onMouseLeave={() => setHoveredNode(null)}>
                    <circle cx={p.x} cy={p.y} r="5" className="node-anchor" />
                  </g>
                ))}
              </svg>

              {hoveredNode && (
                <div className="chart-live-tooltip" style={{ left: `${(hoveredNode.x / width) * 100}%`, top: `${(hoveredNode.y / height) * 100}%` }}>
                  <div className="tooltip-title">🤿 {hoveredNode.diveTitle}</div>
                  <div className="tooltip-row">📍 {hoveredNode.location?.split(",")[0]}</div>
                  <div className="tooltip-meta"><span>📅 {hoveredNode.date}</span> <span className="highlight-depth">📉 {hoveredNode.depthMeters}m</span></div>
                  <div className="tooltip-sac"><Droplets size={14} /> SAC Rate: {calculateSAC(hoveredNode) || "N/A"} bar/min</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}