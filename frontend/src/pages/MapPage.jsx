import { useEffect, useRef, useState } from "react"
import Globe from "react-globe.gl"
import { getAllDives } from "../api/diveApi"
import { useNavigate } from "react-router-dom"
import { calculateSAC } from "../components/DiveCalculations"
import { Eye, Compass, Anchor } from "lucide-react"
import "./MapPage.css"

function depthToColor(depth) {
  if (!depth || depth === 0) return { hex: "#38bdf8", r: 56, g: 189, b: 248 }
  if (depth <= 10) return { hex: "#38bdf8", r: 56, g: 189, b: 248 }
  if (depth <= 20) return { hex: "#22c55e", r: 34, g: 197, b: 94 }
  if (depth <= 30) return { hex: "#eab308", r: 234, g: 179, b: 8 }
  return { hex: "#ef4444", r: 239, g: 68, b: 68 }
}

function getSize() {
  return { width: window.innerWidth, height: window.innerHeight }
}

export default function MapPage() {
  const globeRef = useRef()
  const containerRef = useRef()
  const navigate = useNavigate()
  const [points, setPoints] = useState([])
  const [wrecks, setWrecks] = useState([]) 
  const [dimensions, setDimensions] = useState(getSize)
  const [loading, setLoading] = useState(true)
  const [fetchingWrecks, setFetchingWrecks] = useState(false)
  const [showWrecks, setShowWrecks] = useState(true)
  const [showDepthFilter, setShowDepthFilter] = useState(false)
  const [depthFilter, setDepthFilter] = useState({ min: 0, max: 100 })
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    function onResize() { setDimensions(getSize()) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // 1. Fetch User Dive Logs
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getAllDives()
        const diveArray = Array.isArray(res) ? res : []
        const validDives = diveArray.filter(d => d.latitude && d.longitude && !isNaN(parseFloat(d.latitude)) && !isNaN(parseFloat(d.longitude)))

        const locationMap = new Map()
        validDives.forEach(d => {
          const lat = parseFloat(d.latitude)
          const lng = parseFloat(d.longitude)
          const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`
          const sacRate = calculateSAC(d)
          
          if (locationMap.has(key)) {
            const existing = locationMap.get(key)
            existing.count++
            existing.maxDepthAtLocation = Math.max(existing.maxDepthAtLocation, Number(d.depthMeters) || 0)
            existing.minDepthAtLocation = Math.min(existing.minDepthAtLocation, Number(d.depthMeters) || 0)
            existing.totalDepth += Number(d.depthMeters) || 0
            if (sacRate) existing.sacRates.push(parseFloat(sacRate))
          } else {
            locationMap.set(key, {
              lat, lng,
              name: d.diveTitle || "Untitled Expedition",
              location: d.location,
              maxDepthAtLocation: Number(d.depthMeters) || 0,
              minDepthAtLocation: Number(d.depthMeters) || 0,
              totalDepth: Number(d.depthMeters) || 0,
              id: d.id,
              count: 1,
              sacRates: sacRate ? [parseFloat(sacRate)] : []
            })
          }
        })
        
        setPoints(Array.from(locationMap.values()).map(p => ({ ...p, isWreck: false })))
      } catch (err) {
        console.error("Failed loading logs:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // 2. Fetch Real Shipwrecks Live via OpenStreetMap Overpass API
  useEffect(() => {
    if (!showWrecks) return
    
    async function fetchGlobalWrecks() {
      setFetchingWrecks(true)
      try {
        const query = `[out:json][timeout:25];
          (
            node["historic"="wreck"];
            node["abandoned"="shipwreck"];
          );
          out body 150;`
        
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        const data = await response.json()
        
        if (data && data.elements) {
          const parsedWrecks = data.elements.map(el => ({
            id: `wreck_${el.id}`,
            lat: el.lat,
            lng: el.lon,
            name: el.tags.name || el.tags.ship_name || "Unidentified Vessel Wreck",
            depth: el.tags.depth || el.tags.water_depth || "Unknown",
            historic: el.tags.historic || "Wreck Site",
            note: el.tags.note || el.tags.description || "Historical marine archaeological structural hazard site entry."
          }))
          setWrecks(parsedWrecks)
        }
      } catch (err) {
        console.error("Overpass down:", err)
      } finally {
        setFetchingWrecks(false)
      }
    }
    
    fetchGlobalWrecks()
  }, [showWrecks])

  const combinedPoints = [
    ...points.filter(p => p.maxDepthAtLocation >= depthFilter.min && p.maxDepthAtLocation <= depthFilter.max),
    ...(showWrecks ? wrecks.map(w => ({ ...w, isWreck: true, maxDepthAtLocation: parseInt(w.depth) || 0 })) : [])
  ]

  const totalDives = points.reduce((sum, p) => sum + p.count, 0)
  const avgDepth = points.length > 0 ? (points.reduce((sum, p) => sum + p.maxDepthAtLocation, 0) / points.length).toFixed(1) : 0
  const deepestPoint = points.length > 0 ? points.reduce((max, p) => p.maxDepthAtLocation > max.maxDepthAtLocation ? p : max, points[0]) : null

  return (
    <div className="map-page-layout">
      <div className="globe-container" ref={containerRef}>
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
          backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
          globeTileEngineUrl={(x, y, z) => `https://mt1.google.com/vt/lyrs=s&x=${x}&y={y}&z=${z}`}
          backgroundColor="#0f172a"
          waitForGlobeReady={true}
          htmlElementsData={combinedPoints}
          htmlLat="lat"
          htmlLng="lng"
          htmlElement={(p) => {
            const el = document.createElement("div")
            el.className = "marker-container"
            
            if (p.isWreck) {
              const depthLabel = p.depth !== "Unknown" ? `${p.depth}m` : "N/A"
              el.innerHTML = `
                <div class="marker-pulse wreck-pulse"></div>
                <div class="marker-core wreck-core">🚢</div>
                <div class="marker-badge-wrapper">
                  <span class="marker-depth-badge wreck-depth-label">⚓ ${depthLabel}</span>
                </div>
                <div class="map-tooltip-fixed wreck-tooltip">
                  <div class="tooltip-header"><strong style="color:#ef4444">🏴‍☠️ LIVE WRECK</strong></div>
                  <div class="tooltip-title">${p.name}</div>
                  <div class="tooltip-detail">📊 Logged Depth: <strong>${depthLabel}</strong></div>
                  <div class="tooltip-detail">🔍 Classification: <strong>${p.historic}</strong></div>
                  <div class="tooltip-description">${p.note}</div>
                </div>
              `
            } else {
              const color = depthToColor(p.maxDepthAtLocation)
              const locationName = p.location ? p.location.split(",")[0] : p.name
              const diveCountBadge = p.count > 1 ? `<span class="marker-count-badge" style="background:${color.hex}">${p.count}</span>` : ""
              const markerDepthBadge = `<span class="marker-depth-badge" style="border-color:${color.hex}">📉 ${p.maxDepthAtLocation}m</span>`
              
              el.innerHTML = `
                <div class="marker-pulse" style="background:rgba(${color.r},${color.g},${color.b},0.35)"></div>
                <div class="marker-core" style="background:${color.hex};box-shadow:0 0 12px ${color.hex}88"></div>
                <div class="marker-badge-wrapper">
                  ${markerDepthBadge}
                  ${diveCountBadge}
                </div>
                <div class="map-tooltip-fixed personal-tooltip">
                  <div class="tooltip-header"><strong style="color:#38bdf8">📍 PERSONAL LOG</strong></div>
                  <div class="tooltip-title">${locationName}</div>
                  <div class="tooltip-detail">📊 Max Depth: <strong>${p.maxDepthAtLocation}m</strong></div>
                  <div class="tooltip-footer-tip">👆 Click to view dive logs</div>
                </div>
              `
              el.addEventListener("click", () => navigate(`/dives/${p.id}`))
            }
            return el
          }}
        />
      </div>

      <button className="stats-toggle-btn" onClick={() => setShowStats(!showStats)}>📊</button>

      {showStats && (
        <div className="stats-floating-card">
          <div className="stats-header">
            <h4>📊 Dive Statistics</h4>
            <button onClick={() => setShowStats(false)}>×</button>
          </div>
          <div className="stats-content">
            <div className="stat-item"><span className="stat-icon">📍</span><span>{points.length} Locations</span></div>
            <div className="stat-item"><span className="stat-icon">🤿</span><span>{totalDives} Total Dives</span></div>
            <div className="stat-item"><span className="stat-icon">📊</span><span>Avg Depth: <strong>{avgDepth}m</strong></span></div>
            {deepestPoint && <div className="stat-item"><span className="stat-icon">🔽</span><span>Deepest: <strong>{deepestPoint.maxDepthAtLocation}m</strong></span></div>}
          </div>
        </div>
      )}

      <div className="map-sidebar-overlay">
        <h2>🌍 Marine Map Globe</h2>
        <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 16px 0" }}>Nautical Exploration Network</p>

        <div className="wreck-toggle-container">
          <div className="toggle-label-group">
            <Anchor size={14} className={fetchingWrecks ? "wreck-icon-spin spin-animation" : "wreck-icon-spin"} />
            <span>{fetchingWrecks ? "Streaming Wrecks..." : "Show Live Shipwrecks"}</span>
          </div>
          <label className="switch-input-ui">
            <input type="checkbox" checked={showWrecks} onChange={(e) => setShowWrecks(e.target.checked)} />
            <span className="switch-slider-round"></span>
          </label>
        </div>

        <p style={{ marginTop: "8px", fontSize: "11px", color: "#64748b" }}>
          {points.length} logged positions · {showWrecks ? wrecks.length : 0} live shipwrecks mapped
        </p>

        {points.length > 0 && (
          <div className="quick-zoom-buttons">
            <button className="zoom-btn" onClick={() => globeRef.current.pointOfView({ lat: points[0].lat, lng: points[0].lng, altitude: 1.8 }, 800)}><Compass size={12} /> Reset View</button>
          </div>
        )}

        <div className="depth-filter-toggle">
          <button className={`filter-btn ${showDepthFilter ? "active" : ""}`} onClick={() => setShowDepthFilter(!showDepthFilter)}>
            <Eye size={12} /> Live Depth Filters
          </button>
        </div>

        {showDepthFilter && (
          <div className="depth-filter-controls">
            <div className="filter-range"><label>Min Depth: {depthFilter.min}m</label><input type="range" min="0" max="50" value={depthFilter.min} onChange={(e) => setDepthFilter({ ...depthFilter, min: parseInt(e.target.value) })} /></div>
            <div className="filter-range"><label>Max Depth: {depthFilter.max}m</label><input type="range" min="0" max="100" value={depthFilter.max} onChange={(e) => setDepthFilter({ ...depthFilter, max: parseInt(e.target.value) })} /></div>
          </div>
        )}

        <button className="map-back-btn" onClick={() => navigate("/")}>← Dashboard</button>
      </div>
    </div>
  )
}