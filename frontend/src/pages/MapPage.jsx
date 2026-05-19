import { useEffect, useRef, useState } from "react"
import Globe from "react-globe.gl"
import { getAllDives } from "../api/diveApi"
import { useNavigate } from "react-router-dom"
import "./MapPage.css"

export default function MapPage() {
  const globeRef = useRef()
  const navigate = useNavigate()
  
  const [points, setPoints] = useState([])
  
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await getAllDives()
        const diveArray = Array.isArray(res) ? res : []

        const validDives = diveArray.filter(
          d => d.latitude !== null && d.longitude !== null && d.latitude !== "" && d.longitude !== ""
        )

        const locationCounts = {}
        validDives.forEach(d => {
          const key = `${parseFloat(d.latitude).toFixed(4)}_${parseFloat(d.longitude).toFixed(4)}`
          locationCounts[key] = (locationCounts[key] || 0) + 1
        })

        const seenLocations = new Set()
        const mapped = []

        validDives.forEach(d => {
          const lat = parseFloat(d.latitude)
          const lng = parseFloat(d.longitude)
          const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`

          if (!seenLocations.has(key)) {
            seenLocations.add(key)
            mapped.push({
              lat,
              lng,
              name: d.diveTitle || "Untitled Expedition",
              location: d.location,
              depth: d.depthMeters || 0,
              id: d.id,
              count: locationCounts[key]
            })
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
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (points.length > 0 && globeRef.current) {
      const timer = setTimeout(() => {
        globeRef.current.pointOfView({ 
          lat: points[0].lat, 
          lng: points[0].lng, 
          altitude: 2.2 
        }, 1200)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [points])

return (
  <div className="map-page-layout">
    <div className="map-sidebar-overlay">
      <h2>Expedition Globe</h2>
      <p>Displaying {points.length} charted dive locations</p>
      
      <button className="global-back-btn" style={{ width: "100%" }} onClick={() => navigate("/")}>
        ← Back to Dashboard
      </button>
    </div>

      <div className="globe-viewport-wrapper" style={{ width: dimensions.width, height: dimensions.height }}>
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
            const el = document.createElement("div")
            el.className = "marker-container"
            
            const countBadge = p.count > 1 ? `<span class="marker-count-badge">x${p.count}</span>` : ""
            
            el.innerHTML = `
              <div class="marker-pulse"></div>
              <div class="marker-core"></div>
              <div class="map-tooltip-fixed">
                <strong>🤿 ${p.name} ${countBadge}</strong>
                <small>${p.depth}m</small>
              </div>
            `
            
            el.style.cursor = "pointer"
            el.onpointerdown = (e) => {
              e.stopPropagation()
              navigate(`/dives/${p.id}`)
            }
            return el
          }}
        />
      </div>
    </div>
  )
}