import { useEffect, useRef, useState } from "react"
import Globe from "react-globe.gl"
import { getAllDives } from "../api/diveApi"
import { useNavigate } from "react-router-dom"
import { MapPin, ChevronUp } from "lucide-react"
import "./MapPage.css"

function depthToColor(depth, maxDepth) {
  if (!depth || maxDepth === 0) return "#38bdf8"
  const ratio = Math.min(depth / maxDepth, 1)
  const stops = ["#38bdf8", "#22c55e", "#eab308", "#ef4444"]
  const index = Math.floor(ratio * (stops.length - 1))
  return stops[index]
}

export default function MapPage() {
  const globeRef = useRef()
  const navigate = useNavigate()
  const [points, setPoints] = useState([])
  const [maxDepth, setMaxDepth] = useState(0)
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [expanded, setExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getAllDives()
        const diveArray = Array.isArray(res) ? res : []
        const validDives = diveArray.filter(
          d => d.latitude !== null && d.longitude !== null && d.latitude !== "" && d.longitude !== ""
        )
        
        if (validDives.length === 0) {
          setPoints([])
          setLoading(false)
          return
        }
        
        const globalMaxDepth = validDives.reduce((max, d) => Math.max(max, Number(d.depthMeters) || 0), 0)
        setMaxDepth(globalMaxDepth)

        const locationMap = new Map()
        
        validDives.forEach(d => {
          const key = `${parseFloat(d.latitude).toFixed(4)}_${parseFloat(d.longitude).toFixed(4)}`
          if (locationMap.has(key)) {
            const existing = locationMap.get(key)
            existing.count++
            existing.maxDepth = Math.max(existing.maxDepth, Number(d.depthMeters) || 0)
          } else {
            locationMap.set(key, {
              lat: parseFloat(d.latitude),
              lng: parseFloat(d.longitude),
              name: d.diveTitle || "Untitled",
              location: d.location,
              maxDepth: Number(d.depthMeters) || 0,
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

  // Auto-focus camera on points when they load
  useEffect(() => {
    if (globeRef.current && points.length > 0) {
      // Point camera roughly at the first coordinate point to kick off viewing experience
      globeRef.current.pointOfView({ lat: points[0].lat, lng: points[0].lng, altitude: 2.0 }, 1000)
    }
  }, [points])

  const legendStops = [
    { label: "Shallow", color: "#38bdf8", range: "0-10m" },
    { label: "Mid", color: "#22c55e", range: "10-20m" },
    { label: "Deep", color: "#eab308", range: "20-30m" },
    { label: "Very deep", color: "#ef4444", range: "30m+" },
  ]

  const totalDivesCount = points.reduce((sum, p) => sum + p.count, 0)

  if (loading) {
    return (
      <div className="map-page-layout">
        <div className="map-loading">
          <div className="map-spinner"></div>
          <p>Loading dive locations...</p>
        </div>
      </div>
    )
  }

  if (points.length === 0) {
    return (
      <div className="map-page-layout">
        <div className="map-sidebar-overlay" style={{ textAlign: 'center' }}>
          <h2><MapPin size={18} /> Expedition Globe</h2>
          <p>No dive locations found</p>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            Add dives with coordinates to see them on the map
          </p>
          <button className="map-back-btn" onClick={() => navigate("/")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="map-page-layout">
      <div className="map-sidebar-overlay" style={isMobile && !expanded ? { padding: '12px' } : {}}>
        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isMobile ? 'pointer' : 'default' }}
          onClick={() => isMobile && setExpanded(!expanded)}
        >
          <h2>
            <MapPin size={isMobile ? 14 : 16} /> Expedition Globe
          </h2>
          {isMobile && (
            <ChevronUp size={14} style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
          )}
        </div>
        
        {(expanded || !isMobile) && (
          <>
            <p>{points.length} dive {points.length === 1 ? 'location' : 'locations'} • {totalDivesCount} total dives</p>

            <div className="depth-legend">
              {legendStops.map(s => (
                <div key={s.label} className="legend-stop">
                  <span className="legend-dot" style={{ background: s.color }} />
                  <span className="legend-label">{s.label}</span>
                  <span className="legend-range">{s.range}</span>
                </div>
              ))}
            </div>

            <button className="map-back-btn" onClick={() => navigate("/")}>
              ← Back to Dashboard
            </button>
          </>
        )}
      </div>

      {/* Explicit structural wrapper to pin rendering size context */}
      <div className="globe-viewport-container">
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
          backgroundColor="#020617"
          
          // Using HTML elements for clean custom rendering layouts and clear readability
          htmlElementsData={points}
          htmlLat="lat"
          htmlLng="lng"
          htmlElement={(p) => {
            const el = document.createElement('div');
            const color = depthToColor(p.maxDepth, maxDepth);
            const locationName = p.location ? p.location.split(',')[0] : p.name;
            const countText = p.count > 1 ? ` (${p.count} dives)` : '';

            el.innerHTML = `
              <div class="custom-globe-marker" style="--marker-color: ${color}">
                <div class="marker-pulse"></div>
                <div class="marker-dot"></div>
                <div class="marker-tooltip-bubble">
                  <strong>${locationName}</strong>
                  <span>Max Depth: ${p.maxDepth}m${countText}</span>
                </div>
              </div>
            `;
            
            el.addEventListener('click', () => {
              navigate(`/dives/${p.id}`);
            });
            
            return el;
          }}
        />
      </div>
    </div>
  )
}