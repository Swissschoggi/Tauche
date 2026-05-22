import { useEffect, useRef, useState, useCallback } from "react"
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

function getSize() {
  return { width: window.innerWidth, height: window.innerHeight }
}

export default function MapPage() {
  const globeRef = useRef()
  const containerRef = useRef()
  const navigate = useNavigate()
  const [points, setPoints] = useState([])
  const [maxDepth, setMaxDepth] = useState(0)
  const [dimensions, setDimensions] = useState(getSize)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function onResize() {
      setDimensions(getSize())
    }
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", () => {
      setTimeout(onResize, 150)
    })
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
    }
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getAllDives()
        const diveArray = Array.isArray(res) ? res : []
        const validDives = diveArray.filter(
          d => d.latitude !== null && d.longitude !== null &&
               d.latitude !== "" && d.longitude !== "" &&
               !isNaN(parseFloat(d.latitude)) && !isNaN(parseFloat(d.longitude))
        )
        const globalMaxDepth = validDives.reduce((max, d) => Math.max(max, Number(d.depthMeters) || 0), 0)
        setMaxDepth(globalMaxDepth)

        const locationMap = new Map()
        validDives.forEach(d => {
          const lat = parseFloat(d.latitude)
          const lng = parseFloat(d.longitude)
          const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`
          if (locationMap.has(key)) {
            const existing = locationMap.get(key)
            existing.count++
            existing.maxDepthAtLocation = Math.max(existing.maxDepthAtLocation, Number(d.depthMeters) || 0)
          } else {
            locationMap.set(key, {
              lat, lng,
              name: d.diveTitle || "Untitled Expedition",
              location: d.location,
              depth: d.depthMeters || 0,
              maxDepthAtLocation: Number(d.depthMeters) || 0,
              id: d.id,
              count: 1
            })
          }
        })
        setPoints(Array.from(locationMap.values()))
      } catch (err) {
        console.error("Failed to load map points:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (points.length > 0 && globeRef.current) {
      const timer = setTimeout(() => {
        globeRef.current.pointOfView({ lat: points[0].lat, lng: points[0].lng, altitude: 2.2 }, 1200)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [points])

  const legendStops = [
    { label: "Shallow", color: "#38bdf8", range: "0–10m" },
    { label: "Mid",     color: "#22c55e", range: "10–20m" },
    { label: "Deep",    color: "#eab308", range: "20–30m" },
    { label: "Max",     color: "#ef4444", range: "30m+" },
  ]

  const totalDives = points.reduce((sum, p) => sum + p.count, 0)

  if (loading) {
    return (
      <div className="map-page-layout">
        <div className="map-loading-state">
          <div className="map-spinner" />
          <p>Loading dive coordinates…</p>
        </div>
      </div>
    )
  }

  if (points.length === 0) {
    return (
      <div className="map-page-layout">
        <div className="map-sidebar-overlay">
          <h2>Expedition Globe</h2>
          <p>No dive locations found. Log dives with a location to see them here.</p>
          <button className="map-back-btn" onClick={() => navigate("/")}>← Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="map-page-layout">
      <div className="globe-container" ref={containerRef}>
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

            const countBadgeHtml = p.count > 1
              ? `<span class="marker-count-badge" style="background:${color.hex};color:#0f172a">×${p.count}</span>`
              : ""

            const locName = p.location ? p.location.split(",")[0] : p.name

            el.innerHTML = `
              <div class="marker-pulse" style="background:rgba(${color.r},${color.g},${color.b},0.35)"></div>
              <div class="marker-core" style="background:${color.hex};box-shadow:0 0 12px ${color.hex}88"></div>
              <div class="map-tooltip-fixed">
                <strong>🤿 ${locName} ${countBadgeHtml}</strong>
                <small style="color:${color.hex}">⬇ ${p.maxDepthAtLocation}m${p.count > 1 ? ` · ${p.count} dives` : ""}</small>
              </div>
            `
            el.style.cursor = "pointer"
            el.addEventListener("pointerup", (e) => {
              e.stopPropagation()
              navigate(`/dives/${p.id}`)
            })
            return el
          }}
        />
      </div>

      <div className="map-sidebar-overlay">
        <h2>🌍 Expedition Globe</h2>
        <p>{points.length} location{points.length !== 1 ? "s" : ""} · {totalDives} dive{totalDives !== 1 ? "s" : ""}</p>

        <div className="depth-legend">
          <p className="legend-title">Depth colour scale</p>
          <div className="legend-bar">
            {legendStops.map(s => (
              <div key={s.label} className="legend-stop">
                <span className="legend-dot" style={{ background: s.color }} />
                <span className="legend-label">{s.label}</span>
                <span className="legend-range-label">{s.range}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="map-back-btn" onClick={() => navigate("/")}>
          ← Dashboard
        </button>
      </div>
    </div>
  )
}