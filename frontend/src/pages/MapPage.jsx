import { useEffect, useRef, useState } from "react"
import Globe from "react-globe.gl"
import { getAllDives } from "../api/diveApi"
import { useNavigate } from "react-router-dom"
import "./MapPage.css"

function depthToColor(depth, maxDepth) {
  if (!depth || maxDepth === 0) return { hex: "#38bdf8", r: 56, g: 189, b: 248 }
  const ratio = Math.min(depth / maxDepth, 1)
  const stops = [
    { r: 56,  g: 189, b: 248 },
    { r: 34,  g: 197, b: 94  },
    { r: 234, g: 179, b: 8   },
    { r: 239, g: 68,  b: 68  },
  ]
  const scaled = ratio * (stops.length - 1)
  const lo = Math.floor(scaled)
  const hi = Math.min(lo + 1, stops.length - 1)
  const t = scaled - lo
  const r = Math.round(stops[lo].r + (stops[hi].r - stops[lo].r) * t)
  const g = Math.round(stops[lo].g + (stops[hi].g - stops[lo].g) * t)
  const b = Math.round(stops[lo].b + (stops[hi].b - stops[lo].b) * t)
  return { r, g, b, hex: `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}` }
}

export default function MapPage() {
  const globeRef = useRef()
  const navigate = useNavigate()
  const [points, setPoints] = useState([])
  const [maxDepth, setMaxDepth] = useState(0)
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    async function load() {
      try {
        const res = await getAllDives()
        const diveArray = Array.isArray(res) ? res : []
        const validDives = diveArray.filter(
          d => d.latitude !== null && d.longitude !== null && d.latitude !== "" && d.longitude !== ""
        )
        const globalMaxDepth = validDives.reduce((max, d) => Math.max(max, Number(d.depthMeters) || 0), 0)
        setMaxDepth(globalMaxDepth)

        const locationCounts = {}
        const locationMaxDepth = {}
        validDives.forEach(d => {
          const key = `${parseFloat(d.latitude).toFixed(4)}_${parseFloat(d.longitude).toFixed(4)}`
          locationCounts[key] = (locationCounts[key] || 0) + 1
          locationMaxDepth[key] = Math.max(locationMaxDepth[key] || 0, Number(d.depthMeters) || 0)
        })

        const seenLocations = new Set()
        const mapped = []
        validDives.forEach(d => {
          const lat = parseFloat(d.latitude)
          const lng = parseFloat(d.longitude)
          const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`
          if (!seenLocations.has(key)) {
            seenLocations.add(key)
            mapped.push({ lat, lng, name: d.diveTitle || "Untitled Expedition", location: d.location, depth: d.depthMeters || 0, maxDepthAtLocation: locationMaxDepth[key], id: d.id, count: locationCounts[key] })
          }
        })
        setPoints(mapped)
      } catch (err) {
        console.error("Failed to load map points:", err)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (points.length > 0 && globeRef.current) {
      const timer = setTimeout(() => {
        globeRef.current.pointOfView({ lat: points[0].lat, lng: points[0].lng, altitude: 2.2 }, 1200)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [points])

  const legendStops = [
    { label: "Shallow", color: "#38bdf8" },
    { label: "Mid",     color: "#22c55e" },
    { label: "Deep",    color: "#eab308" },
    { label: "Very deep", color: "#ef4444" },
  ]

  return (
    <div className="map-page-layout">
      <div className="map-sidebar-overlay">
        <h2>Expedition Globe</h2>
        <p>Displaying {points.length} charted dive locations</p>

        {points.length > 0 && (
          <div className="depth-legend">
            <p className="legend-title">Depth Heatmap</p>
            <div className="legend-bar">
              {legendStops.map(s => (
                <div key={s.label} className="legend-stop">
                  <span className="legend-dot" style={{ background: s.color }} />
                  <span className="legend-label">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="legend-range">0m — {maxDepth}m max</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
          <button className="map-back-btn" style={{ width: "100%" }} onClick={() => navigate("/")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="globe-container">
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
          backgroundColor="#0f172a"
          htmlElementsData={points}
          htmlLat="lat"
          htmlLng="lng"
          htmlElement={(p) => {
            const color = depthToColor(p.maxDepthAtLocation, maxDepth)
            const el = document.createElement("div")
            el.className = "marker-container"
            const countBadge = p.count > 1 ? `<span class="marker-count-badge" style="background:${color.hex}">x${p.count}</span>` : ""
            el.innerHTML = `
              <div class="marker-pulse" style="background:rgba(${color.r},${color.g},${color.b},0.4)"></div>
              <div class="marker-core" style="background:${color.hex};box-shadow:0 0 10px ${color.hex}"></div>
              <div class="map-tooltip-fixed">
                <strong>🤿 ${p.name} ${countBadge}</strong>
                <small style="color:${color.hex}">${p.maxDepthAtLocation}m</small>
              </div>
            `
            el.style.cursor = "pointer"
            el.onpointerdown = (e) => { e.stopPropagation(); navigate(`/dives/${p.id}`) }
            return el
          }}
        />
      </div>
    </div>
  )
}