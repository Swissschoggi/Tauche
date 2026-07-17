import { useEffect, useState, useMemo } from "react"
import { getSightings, getImageUrl } from "../api/diveApi"
import { Waves, Eye, ArrowLeft, AlertCircle, Search, ArrowUpDown, ChevronDown, ChevronUp, Camera } from "lucide-react"
import PhotoLightbox from "../components/PhotoLightbox"
import "./SightingsPage.css"

export default function SightingsPage() {
  const [sightings, setSightings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("count")
  const [expanded, setExpanded] = useState(null)
  const [thumbnails, setThumbnails] = useState({})
  const [expandedThumbnails, setExpandedThumbnails] = useState({})
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    getSightings()
      .then(async (data) => {
        setSightings(data)
        const thumbs = {}
        for (const s of data) {
          if (s.imagePath) thumbs[s.species] = await getImageUrl(s.imagePath)
        }
        setThumbnails(thumbs)
      })
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false))
  }, [])

  const loadExpanded = async (species) => {
    if (expandedThumbnails[species]) return
    const s = sightings.find(x => x.species === species)
    if (!s?.imagePaths) return
    const urls = await Promise.all(s.imagePaths.map(p => getImageUrl(p)))
    setExpandedThumbnails(prev => ({ ...prev, [species]: urls }))
  }

  const handleExpand = (species) => {
    if (expanded === species) {
      setExpanded(null)
    } else {
      setExpanded(species)
      loadExpanded(species)
    }
  }

  const filtered = useMemo(() => {
    let list = [...sightings]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(s => s.species.toLowerCase().includes(q))
    }
    if (sortBy === "alpha") {
      list.sort((a, b) => a.species.localeCompare(b.species))
    }
    return list
  }, [sightings, search, sortBy])

  const totalSpecies = sightings.length
  const totalSightings = sightings.reduce((sum, s) => sum + s.count, 0)
  const mostCommon = sightings[0]

  return (
    <div className="sightings-page">
      <div className="sightings-header">
        <button className="btn-back" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1><Eye size={24} /> Marine Life Sightings</h1>
      </div>

      {loading && <div className="sightings-loading">Loading sightings…</div>}

      {error && (
        <div className="sightings-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!loading && !error && sightings.length === 0 && (
        <div className="sightings-empty">
          <Waves size={48} />
          <h2>No Sightings Yet</h2>
          <p>Tag species in your dive gallery photos to see them here.</p>
        </div>
      )}

      {!loading && !error && sightings.length > 0 && (
        <>
          <div className="sightings-stats">
            <div className="stat-card">
              <span className="stat-value">{totalSpecies}</span>
              <span className="stat-label">Species</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalSightings}</span>
              <span className="stat-label">Total Sightings</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{mostCommon?.species ?? "—"}</span>
              <span className="stat-label">Most Common</span>
            </div>
          </div>

          <div className="sightings-controls">
            <div className="sightings-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search species..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="sightings-sort-btn" onClick={() => setSortBy(sortBy === "count" ? "alpha" : "count")}>
              <ArrowUpDown size={15} />
              {sortBy === "count" ? "Count" : "A–Z"}
            </button>
          </div>

          <div className="sightings-list">
            {filtered.map((s) => {
              const isExpanded = expanded === s.species
              return (
                <div
                  key={s.species}
                  className={`sighting-card ${isExpanded ? "expanded" : ""}`}
                >
                  <div className="sighting-main" onClick={() => handleExpand(s.species)}>
                    {thumbnails[s.species] ? (
                      <img
                        src={thumbnails[s.species]}
                        alt={s.species}
                        className="sighting-thumb"
                      />
                    ) : (
                      <div className="sighting-thumb sighting-thumb-placeholder">
                        <Camera size={20} />
                      </div>
                    )}
                    <div className="sighting-info">
                      <span className="sighting-species">{s.species}</span>
                      <span className="sighting-count">{s.count} sighting{s.count !== 1 ? "s" : ""}</span>
                      {s.diveCount > 1 && (
                        <span className="sighting-dives">across {s.diveCount} dive{s.diveCount !== 1 ? "s" : ""}</span>
                      )}
                      {s.lastSeen && (
                        <span className="sighting-last">Last: {s.lastSeen}</span>
                      )}
                    </div>
                    <div className="sighting-expand-icon">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {isExpanded && expandedThumbnails[s.species]?.length > 0 && (
                    <div className="sighting-photos-strip">
                      {expandedThumbnails[s.species].map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`${s.species} ${i + 1}`}
                          className="sighting-photo-thumb"
                          onClick={(e) => { e.stopPropagation(); setLightbox({ photos: expandedThumbnails[s.species], index: i }) }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="sightings-no-results">
              No species match "{search}"
            </div>
          )}
        </>
      )}

      {lightbox && (
        <PhotoLightbox
          photos={lightbox.photos.map(url => ({ url }))}
          currentIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(idx) => setLightbox(l => l ? { ...l, index: idx } : null)}
        />
      )}
    </div>
  )
}
