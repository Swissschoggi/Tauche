import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getDiveById, updateDive, uploadDiveImage } from "../api/diveApi" 
import {
  Calendar, MapPin, ArrowDown, Timer, Compass, Thermometer,
  Eye, Waves, Cloud, Shirt, Weight, Gauge, User, Building,
  FlaskRound, FileText
} from "lucide-react"
import "./DiveInfo.css"

// ==========================================================================
// CENTRALIZED UNIT FORMATTING HUB (Reads settings configuration state)
// ==========================================================================
function formatValueWithUnits(name, value, isMetric) {
  if (value === undefined || value === null || value === "") return "—"
  const num = Number(value)
  if (isNaN(num)) return value // Fallback for plain strings like "Date" or "Type"

  switch (name) {
    case "depthMeters":
      return isMetric ? `${num} meters` : `${Math.round(num * 3.28084)} feet`
    case "waterTemperatureCelsius":
      return isMetric ? `${num} °C` : `${Math.round((num * 9) / 5 + 32)} °F`
    case "pressureStartBar":
    case "pressureEndBar":
      return isMetric ? `${num} bar` : `${Math.round(num * 14.5038)} psi`
    case "durationMinutes":
      return `${num} mins`
    case "visibilityMeters":
      return isMetric ? `${num} m` : `${Math.round(num * 3.28084)} ft`
    case "weightKg":
      return isMetric ? `${num} kg` : `${Math.round(num * 2.20462)} lbs`
    default:
      return value
  }
}

function EditableRow({ editing, icon: Icon, label, name, value, onChange, isMetric }) {
  return (
    <div className="info-row">
      <div className="info-row-left">
        <Icon size={16} />
        <span className="label">{label}:</span>
      </div>

      {editing ? (
        <input
          className="info-row-input"
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <span className="value">
          {formatValueWithUnits(name, value, isMetric)}
        </span>
      )}
    </div>
  )
}

export default function DiveInfo() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [dive, setDive] = useState(null)
  const [formData, setFormData] = useState(null)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Reactive settings hook tracking metric preferences
  const localMetricSetting = localStorage.getItem("useMetric")
  const isMetric = localMetricSetting !== null ? JSON.parse(localMetricSetting) : true

  useEffect(() => {
    async function load() {
      try {
        const res = await getDiveById(id)
        if (!res) return

        const actualData = res?.data ? res.data : res
        setDive(actualData)
        setFormData(actualData)
      } catch (err) {
        console.error("Failed loading target dive detail view:", err)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!formData?.location || formData.location.length < 2) {
      setSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            formData.location
          )}&format=json&limit=5`
        )
        const data = await res.json()
        setSuggestions(data)
      } catch (err) {
        console.error("Geocoding lookup failed:", err)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [formData?.location])

  async function handleSave() {
    try {
      let currentDiveState = { ...formData }

      if (imageFile) {
        const updatedDiveFromUpload = await uploadDiveImage(id, imageFile)
        if (updatedDiveFromUpload?.imagePath) {
          currentDiveState.imagePath = updatedDiveFromUpload.imagePath
        }
      }

      const payload = {}
      Object.entries(currentDiveState).forEach(([key, value]) => {
        if ((key === "latitude" || key === "longitude") && (value === "" || value == null)) {
          return
        }
        
        const numberFields = [
          "depthMeters", 
          "durationMinutes", 
          "waterTemperatureCelsius", 
          "visibilityMeters", 
          "weightKg", 
          "pressureStartBar", 
          "pressureEndBar"
        ]
        if (numberFields.includes(key) && value !== "" && value !== null) {
          payload[key] = value.toString().includes(".") ? parseFloat(value) : parseInt(value, 10)
          return
        }

        if (value !== undefined && value !== null) {
          payload[key] = value
        }
      })

      const res = await updateDive(id, payload)
      const finalizedDive = res ?? payload
      setDive(finalizedDive)
      setFormData(finalizedDive)
      setIsEditing(false)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error("Failed to commit updated dive metrics:", err)
    }
  }

  async function handleImageChange(file) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  if (!dive || !formData) return <div className="dive-detail-page" style={{textAlign:"center", paddingTop:"120px"}}><p>Retrieving coordinates...</p></div>

  return (
    <div className="dive-detail-page">

      <button className="back-dashboard-global-btn" onClick={() => navigate("/")}>
        ← Back to Dashboard
      </button>

      <div className="dive-hero">
        <img
          src={
            imagePreview ||
            (dive.imagePath
              ? (dive.imagePath.startsWith("http") 
                  ? dive.imagePath 
                  : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${dive.imagePath}`)
              : "https://placehold.co/600x400?text=Dive")
          }
          alt="Dive view"
        />

        {isEditing && (
          <label className="image-upload-btn">
            📷 Change image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files[0])}
            />
          </label>
        )}

        <div className="hero-overlay">
          {isEditing ? (
            <input
              className="hero-title-input"
              value={formData.diveTitle || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, diveTitle: e.target.value }))
              }
            />
          ) : (
            <h1>{dive.diveTitle || "Uncharted Log Entry"}</h1>
          )}

          <p><MapPin size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} /> {dive.location || "Unknown Coordinates"}</p>
        </div>
      </div>

      <div className="dive-grid-info">

        <div className="info-card">
          <h3>Core Dive</h3>

          <EditableRow
            editing={isEditing}
            icon={Calendar}
            label="Date"
            name="date"
            value={formData.date}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <div className="info-row">
            <div className="info-row-left">
              <MapPin size={16} />
              <span className="label">Location:</span>
            </div>

            {isEditing ? (
              <div style={{ position: "relative", flex: 1, width: "100%" }}>
                <input
                  className="info-row-input"
                  value={formData.location || ""}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, location: e.target.value }))
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions">
                    {suggestions.map((s) => (
                      <div
                        key={s.place_id}
                        className="suggestion-item"
                        onMouseDown={() => {
                          setFormData(prev => ({
                            ...prev,
                            location: s.display_name,
                            latitude: parseFloat(s.lat),
                            longitude: parseFloat(s.lon),
                          }))
                          setSuggestions([])
                          setShowSuggestions(false)
                        }}
                      >
                        {s.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="value">{formData.location || "-"}</span>
            )}
          </div>

          <EditableRow
            editing={isEditing}
            icon={ArrowDown}
            label="Depth"
            name="depthMeters"
            value={formData.depthMeters}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Timer}
            label="Duration"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Compass}
            label="Type"
            name="diveType"
            value={formData.diveType}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />
        </div>

        <div className="info-card">
          <h3>Conditions</h3>

          <EditableRow
            editing={isEditing}
            icon={Waves}
            label="Water"
            name="waterType"
            value={formData.waterType}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Thermometer}
            label="Temp"
            name="waterTemperatureCelsius"
            value={formData.waterTemperatureCelsius}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Eye}
            label="Visibility"
            name="visibilityMeters"
            value={formData.visibilityMeters}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Cloud}
            label="Weather"
            name="weather"
            value={formData.weather}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />
        </div>

        <div className="info-card">
          <h3>Equipment</h3>

          <EditableRow
            editing={isEditing}
            icon={Shirt}
            label="Suit"
            name="suit"
            value={formData.suit}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={FlaskRound}
            label="Gas"
            name="gas"
            value={formData.gas}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Weight}
            label="Weight"
            name="weightKg"
            value={formData.weightKg}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Gauge}
            label="Start Pressure"
            name="pressureStartBar"
            value={formData.pressureStartBar}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Gauge}
            label="End Pressure"
            name="pressureEndBar"
            value={formData.pressureEndBar}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />
        </div>

        <div className="info-card">
          <h3>People</h3>

          <EditableRow
            editing={isEditing}
            icon={User}
            label="Buddy"
            name="buddy"
            value={formData.buddy}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />

          <EditableRow
            editing={isEditing}
            icon={Building}
            label="Dive Center"
            name="diveCenter"
            value={formData.diveCenter}
            onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
            isMetric={isMetric}
          />
        </div>

      </div>

      <button className="submit-btn" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
        {isEditing ? "Save Log Changes" : "Edit Parameters"}
      </button>

    </div>
  )
}