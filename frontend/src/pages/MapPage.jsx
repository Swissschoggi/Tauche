import { useEffect, useRef, useState, useCallback } from "react"
import Globe from "react-globe.gl"
import { getAllDives } from "../api/diveApi"
import { useNavigate } from "react-router-dom"
import { calculateSAC } from "../components/DiveCalculations"
import {
  Search, SlidersHorizontal, BarChart3, ArrowLeft,
  Compass, Target, X, ChevronRight, Wind, Anchor,
  Users, Calendar, Gauge, MapPin, TrendingDown
} from "lucide-react"
import "./MapPage.css"

/* ─── Depth → colour (Consistent App Palette) ─────────────────────── */
function depthToColor(depth) {
  if (!depth || depth === 0) return { hex: "#38bdf8", r: 56,  g: 189, b: 248 }
  if (depth <= 10)           return { hex: "#38bdf8", r: 56,  g: 189, b: 248 }
  if (depth <= 20)           return { hex: "#22c55e", r: 34,  g: 197, b: 94  }
  if (depth <= 30)           return { hex: "#eab308", r: 234, g: 179, b: 8   }
  return                            { hex: "#ef4444", r: 239, g: 68,  b: 68  }
}

/* ─── Depth gauge SVG ───────────────────────────────────────────────── */
function DepthGauge({ depth, maxDepth = 50 }) {
  const pct  = Math.min(depth / maxDepth, 1)
  const col  = depthToColor(depth).hex
  const r    = 26
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" style={{flexShrink: 0}}>
      <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
      <circle
        cx="34" cy="34" r={r}
        fill="none" stroke={col} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        strokeDashoffset={circ * 0.25}
        style={{ transition: "stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x="34" y="31" textAnchor="middle" fill={col}
        fontSize="12" fontFamily="Inter, system-ui, sans-serif" fontWeight="700">{depth}m</text>
      <text x="34" y="44" textAnchor="middle" fill="rgba(255,255,255,0.3)"
        fontSize="8" fontFamily="Inter, system-ui, sans-serif">depth</text>
    </svg>
  )
}

export default function MapPage() {
  const globeRef = useRef()
  const mapContainerRef = useRef()
  const navigate = useNavigate()

  const [points,        setPoints]        = useState([])
  const [dimensions,    setDimensions]    = useState({ width: 800, height: 500 })
  const [loading,       setLoading]       = useState(true)
  const [depthFilter,   setDepthFilter]   = useState({ min: 0, max: 100 })
  const [searchQuery,   setSearchQuery]   = useState("")
  const [activePanel,   setActivePanel]   = useState(null) // "search" | "filter" | "stats"
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [hoveredId,     setHoveredId]     = useState(null)

  const satelliteBase = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"

  const telemetryLegend = [
    { hex: "#38bdf8", range: "0-10m", label: "Shallow" },
    { hex: "#22c55e", range: "11-20m", label: "Recreational" },
    { hex: "#eab308", range: "21-30m", label: "Deep Reef" },
    { hex: "#ef4444", range: "30m+", label: "Technical" }
  ]

  /* Dynamically size globe wrapper to fit layout container context grid */
  useEffect(() => {
    if (!mapContainerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })
    resizeObserver.observe(mapContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [loading])

  /* Load dive points */
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res       = await getAllDives()
        const diveArray = Array.isArray(res) ? res : []
        const valid     = diveArray.filter(
          d => d.latitude && d.longitude &&
               !isNaN(parseFloat(d.latitude)) && !isNaN(parseFloat(d.longitude))
        )
        const locMap = new Map()
        valid.forEach(d => {
          const lat = parseFloat(d.latitude)
          const lng = parseFloat(d.longitude)
          const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`
          const sac = calculateSAC(d)
          if (locMap.has(key)) {
            const e = locMap.get(key)
            e.count++
            e.maxDepthAtLocation = Math.max(e.maxDepthAtLocation, Number(d.depthMeters) || 0)
            e.minDepthAtLocation = Math.min(e.minDepthAtLocation, Number(d.depthMeters) || 0)
            e.totalDepth        += Number(d.depthMeters) || 0
            if (sac) e.sacRates.push(parseFloat(sac))
            e.dates.push(d.date)
            if (d.buddy && !e.buddies.includes(d.buddy)) e.buddies.push(d.buddy)
          } else {
            locMap.set(key, {
              lat, lng,
              name: d.diveTitle || "Untitled Expedition",
              location: d.location,
              maxDepthAtLocation: Number(d.depthMeters) || 0,
              minDepthAtLocation: Number(d.depthMeters) || 0,
              totalDepth: Number(d.depthMeters) || 0,
              id: d.id, count: 1,
              sacRates: sac ? [parseFloat(sac)] : [],
              dates: [d.date],
              buddies: d.buddy ? [d.buddy] : []
            })
          }
        })
        const processed = Array.from(locMap.values()).map(p => ({
          ...p,
          avgDepth: (p.totalDepth / p.count).toFixed(1),
          avgSac:   p.sacRates.length
            ? (p.sacRates.reduce((a,b)=>a+b,0)/p.sacRates.length).toFixed(1)
            : null,
          firstDive: p.dates.filter(Boolean).sort()[0],
          lastDive:  p.dates.filter(Boolean).sort().reverse()[0]
        }))
        setPoints(processed)
      } catch (err) {
        console.error("Map load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* Focus first position on start */
  useEffect(() => {
    if (points.length > 0 && globeRef.current) {
      const t = setTimeout(() => {
        globeRef.current.pointOfView({ lat: points[0].lat, lng: points[0].lng, altitude: 1.8 }, 1200)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [points])

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Escape") return
      if (document.activeElement?.tagName === "INPUT") {
        document.activeElement.blur()
      }
      setActivePanel(null)
      setSelectedPoint(null)
    }
    document.addEventListener("keydown", handler, true)
    return () => document.removeEventListener("keydown", handler, true)
  }, [])

  const zoomTo = useCallback((p) => {
    globeRef.current?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 0.7 }, 800)
  }, [])

  const resetView = useCallback(() => {
    if (globeRef.current && points.length > 0)
      globeRef.current.pointOfView({ lat: points[0].lat, lng: points[0].lng, altitude: 1.8 }, 800)
  }, [points])

  const togglePanel = (name) => setActivePanel(prev => prev === name ? null : name)

  const filteredPoints = points.filter(p => {
    const okDepth  = p.maxDepthAtLocation >= depthFilter.min && p.maxDepthAtLocation <= depthFilter.max
    const okSearch = `${p.name} ${p.location || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
    return okDepth && okSearch
  })

  const totalDives   = points.reduce((s, p) => s + p.count, 0)
  const avgDepth     = points.length
    ? (points.reduce((s,p)=>s+p.maxDepthAtLocation,0)/points.length).toFixed(1)
    : "—"
  const deepestPoint = points.length
    ? points.reduce((m,p) => p.maxDepthAtLocation > m.maxDepthAtLocation ? p : m, points[0])
    : null
  const bestSac = points.some(p=>p.avgSac)
    ? points.filter(p=>p.avgSac).reduce((m,p) => parseFloat(p.avgSac)<parseFloat(m.avgSac)?p:m, points.find(p=>p.avgSac))
    : null

  if (loading) return (
    <div className="mp-dashboard-container">
      <div className="mp-card-loader">
        <div className="mp-loading-ring" />
        <p className="mp-loading-text">Synchronizing marine telemetry maps…</p>
      </div>
    </div>
  )

  return (
    <div className="mp-dashboard-container">
      
      {/* ── Header Toolbar Layout Controls ── */}
      <header className="mp-dashboard-header">
        <div className="mp-header-left">
          <button className="mp-back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
          <div className="mp-header-divider" />
          <div>
            <h1 className="mp-page-title">Expedition Map Globe</h1>
            <p className="mp-page-subtitle">{filteredPoints.length} locations documented across {totalDives} logs</p>
          </div>
        </div>

        <div className="mp-header-actions">
          <button className={`mp-action-tab ${activePanel === "search" ? "active" : ""}`} onClick={() => togglePanel("search")}>
            <Search size={14} />
            <span>Search</span>
          </button>
          <button className={`mp-action-tab ${activePanel === "filter" ? "active" : ""}`} onClick={() => togglePanel("filter")}>
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
          <button className={`mp-action-tab ${activePanel === "stats" ? "active" : ""}`} onClick={() => togglePanel("stats")}>
            <BarChart3 size={14} />
            <span>Analytics</span>
          </button>
          <div className="mp-header-divider" />
          <button className="mp-utility-btn" onClick={resetView} title="Reset Camera View">
            <Compass size={15} />
          </button>
        </div>
      </header>

      {/* ── Main Map Canvas Frame View ── */}
      <main className="mp-viewport-body" ref={mapContainerRef}>
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
          backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
          globeTileEngineUrl={(x,y,z) => satelliteBase.replace("{x}",x).replace("{y}",y).replace("{z}",z)}
          backgroundColor="#0f172a"
          waitForGlobeReady={true}

          htmlElementsData={filteredPoints}
          htmlLat="lat"
          htmlLng="lng"
          htmlElement={(p) => {
            const col = depthToColor(p.maxDepthAtLocation)
            const el = document.createElement("div")
            const isForced = hoveredId === p.id
            el.className = `mp-marker ${isForced ? "mp-marker--open" : ""}`
            
            // Explicit style configurations to make markers clickable inside Three.js container overlays
            el.style.cursor = "pointer"
            el.style.pointerEvents = "auto"

            el.innerHTML = `
              <div class="mp-marker-pulse" style="background:rgba(${col.r},${col.g},${col.b},0.25)"></div>
              <div class="mp-marker-dot"   style="background:${col.hex};box-shadow:0 0 10px ${col.hex}88"></div>
              ${p.count > 1 ? `<span class="mp-marker-badge" style="background:${col.hex}">${p.count}</span>` : ""}
              <div class="mp-marker-label" style="border-color:${col.hex}44">
                <span style="color:${col.hex}">${p.maxDepthAtLocation}m</span>
              </div>
            `
            
            // Click Handler definition to center on coordinates and trigger layout popover
            el.addEventListener("click", (e) => {
              e.stopPropagation()
              zoomTo(p)
              setSelectedPoint(p)
              setActivePanel(null)
            })
            return el
          }}

          ringsData={filteredPoints}
          ringLat="lat"
          ringLng="lng"
          ringColor={(p) => [depthToColor(p.maxDepthAtLocation).hex, "rgba(0,0,0,0)"]}
          ringMaxRadius={(p) => Math.min(2.5, 1.2 + p.count * 0.3)}
          ringPropagationSpeed={2.5}
          ringRepeatPeriod={1400}
        />

        {/* ── Floating Overlay Controls Context Menus ── */}
        {activePanel && (
          <div className="mp-floating-panel">
            {activePanel === "search" && (
              <>
                <div className="mp-panel-header">
                  <div className="mp-panel-headline"><Search size={14} className="cyan" /><span>Search Sites</span></div>
                  <button className="mp-close-overlay" onClick={() => setActivePanel(null)}><X size={14} /></button>
                </div>
                <div className="mp-panel-inner">
                  <div className="mp-search-box-wrap">
                    <Search size={13} className="mp-search-embedded-icon" />
                    <input
                      className="mp-search-field"
                      type="text"
                      placeholder="Filter by title or country..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="mp-list-group">
                    {filteredPoints.length === 0 ? (
                      <p className="mp-empty-text">No active points found</p>
                    ) : (
                      filteredPoints.map(p => {
                        const col = depthToColor(p.maxDepthAtLocation)
                        return (
                          <button key={p.id} className="mp-list-row"
                            onClick={() => { zoomTo(p); setSelectedPoint(p); setActivePanel(null) }}
                            onMouseEnter={() => setHoveredId(p.id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
                            <span className="mp-row-indicator" style={{ background: col.hex }} />
                            <span className="mp-row-text">{p.location?.split(",")[0] || p.name}</span>
                            <span className="mp-row-tag">{p.maxDepthAtLocation}m</span>
                            <ChevronRight size={12} />
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            {activePanel === "filter" && (
              <>
                <div className="mp-panel-header">
                  <div className="mp-panel-headline"><SlidersHorizontal size={14} className="yellow" /><span>Depth Configurations</span></div>
                  <button className="mp-close-overlay" onClick={() => setActivePanel(null)}><X size={14} /></button>
                </div>
                <div className="mp-panel-inner">
                  <div className="mp-range-group">
                    <div className="mp-range-title"><span>Minimum Depth Range</span><b className="cyan">{depthFilter.min}m</b></div>
                    <input type="range" className="mp-range-slider" min="0" max="50" value={depthFilter.min} onChange={e => setDepthFilter({ ...depthFilter, min: +e.target.value })} />
                  </div>
                  <div className="mp-range-group">
                    <div className="mp-range-title"><span>Maximum Depth Range</span><b className="cyan">{depthFilter.max}m</b></div>
                    <input type="range" className="mp-range-slider" min="0" max="100" value={depthFilter.max} onChange={e => setDepthFilter({ ...depthFilter, max: +e.target.value })} />
                  </div>

                  <div className="mp-legend-section">
                    <p className="mp-legend-title">Telemetry Colors</p>
                    <div className="mp-legend-grid">
                      {telemetryLegend.map((item) => (
                        <div key={item.range} className="mp-legend-item">
                          <span className="mp-legend-dot" style={{ background: item.hex }} />
                          <span className="mp-legend-label">{item.range} · {item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePanel === "stats" && (
              <>
                <div className="mp-panel-header">
                  <div className="mp-panel-headline"><BarChart3 size={14} className="green" /><span>Metrics Overview</span></div>
                  <button className="mp-close-overlay" onClick={() => setActivePanel(null)}><X size={14} /></button>
                </div>
                <div className="mp-panel-inner">
                  <div className="mp-stats-mosaic">
                    <div className="mp-stat-block"><MapPin size={14} className="cyan" /><h3>{points.length}</h3><p>Unique Sites</p></div>
                    <div className="mp-stat-block"><Anchor size={14} className="green" /><h3>{totalDives}</h3><p>Logged Dives</p></div>
                    <div className="mp-stat-block"><Gauge size={14} className="yellow" /><h3>{avgDepth}m</h3><p>Average Depth</p></div>
                    {deepestPoint && <div className="mp-stat-block"><TrendingDown size={14} className="red" /><h3>{deepestPoint.maxDepthAtLocation}m</h3><p>Max Descent</p></div>}
                  </div>

                  {bestSac && (
                    <div className="mp-highlight-feature">
                      <Wind size={13} className="cyan" />
                      <div><h6>Optimal Gas Consumption</h6><p>{bestSac.avgSac} bar/min @ {bestSac.location?.split(",")[0] || bestSac.name}</p></div>
                    </div>
                  )}

                  {deepestPoint && (
                    <button className="mp-cta-fly" onClick={() => { zoomTo(deepestPoint); setSelectedPoint(deepestPoint); setActivePanel(null) }}>
                      <Target size={14} /><span>Focus Deepest Coordination</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Detail Float Card Context Popover ── */}
        {selectedPoint && (() => {
          const col = depthToColor(selectedPoint.maxDepthAtLocation)
          return (
            <div className="mp-popover-card">
              <div className="mp-popover-stripe" style={{ background: col.hex }} />
              <button className="mp-popover-close" onClick={() => setSelectedPoint(null)}><X size={14} /></button>

              <div className="mp-popover-body">
                <div className="mp-popover-main">
                  <DepthGauge depth={selectedPoint.maxDepthAtLocation} maxDepth={Math.max(50, selectedPoint.maxDepthAtLocation + 10)} />
                  <div className="mp-popover-header">
                    <h4>{selectedPoint.location?.split(",")[0] || selectedPoint.name}</h4>
                    {selectedPoint.location && <p>{selectedPoint.location}</p>}
                  </div>
                </div>

                <div className="mp-popover-meta-list">
                  {selectedPoint.count > 1 && <div className="mp-popover-meta-row"><Anchor size={12} /><span>{selectedPoint.count} entries ({selectedPoint.minDepthAtLocation}m - {selectedPoint.maxDepthAtLocation}m)</span></div>}
                  {selectedPoint.avgSac && <div className="mp-popover-meta-row"><Wind size={12} /><span>Mean SAC Rate: {selectedPoint.avgSac} bar/min</span></div>}
                  {selectedPoint.buddies.length > 0 && <div className="mp-popover-meta-row"><Users size={12} /><span>Buddies: {selectedPoint.buddies.join(", ")}</span></div>}
                  {selectedPoint.firstDive && <div className="mp-popover-meta-row"><Calendar size={12} /><span>Logged Date: {selectedPoint.firstDive?.substring(0, 10)}</span></div>}
                </div>
              </div>

              <button className="mp-popover-action" onClick={() => navigate(`/dives/${selectedPoint.id}`)}>
                <span>Explore Full Digital Logbook</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )
        })()}
      </main>
    </div>
  )
}