import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getDiveById, updateDive, uploadDiveImage } from "../api/diveApi" 
import {
  Calendar, MapPin, ArrowDown, Timer, Compass, Thermometer,
  Eye, Waves, Cloud, Shirt, Weight, Gauge, User, Building,
  FlaskRound
} from "lucide-react"
import "./DiveInfo.css"

function formatValueWithUnits(name, value, isMetric) {
  if (value === undefined || value === null || value === "") return "—"
  const num = Number(value)
  if (isNaN(num)) return value 

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

function convertMetricToInput(name, value, isMetric) {
  if (value === undefined || value === null || value === "" || isMetric) return value;
  const num = Number(value);
  if (isNaN(num)) return value;

  switch (name) {
    case "depthMeters":
    case "visibilityMeters":
      return (num * 3.28084).toFixed(1);
    case "waterTemperatureCelsius":
      return ((num * 9) / 5 + 32).toFixed(1);
    case "pressureStartBar":
    case "pressureEndBar":
      return Math.round(num * 14.5038);
    case "weightKg":
      return (num * 2.20462).toFixed(1);
    default:
      return value;
  }
}

function convertInputToMetric(name, value, isMetric) {
  if (value === undefined || value === null || value === "" || isMetric) return value;
  const num = Number(value);
  if (isNaN(num)) return value;

  switch (name) {
    case "depthMeters":
    case "visibilityMeters":
      return num / 3.28084;
    case "waterTemperatureCelsius":
      return ((num - 32) * 5) / 9;
    case "pressureStartBar":
    case "pressureEndBar":
      return num / 14.5038;
    case "weightKg":
      return num / 2.20462;
    default:
      return value;
  }
}

function EditableRow({ editing, icon: Icon, label, name, value, onChange, isMetric }) {
  const displayInputValue = editing ? convertMetricToInput(name, value, isMetric) : value;

  return (
    <div className="info-row">
      <div className="info-row-left">
        <Icon size={16} />
        <span className="label">{label}:</span>
      </div>

      {editing ? (
        <input
          className="info-row-input"
          value={displayInputValue ?? ""}
          onChange={(e) => {
            const normalizedMetricValue = convertInputToMetric(name, e.target.value, isMetric);
            onChange(name, normalizedMetricValue);
          }}
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
        console.error(err)
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
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.location)}&format=json&limit=5`)
        const data = await res.json()
        setSuggestions(data)
      } catch (err) {
        console.error(err)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [formData?.location])

  async function handleSave() {
    try {
      let currentDiveState = { ...formData }
      if (imageFile) {
        try {
          const updatedDiveFromUpload = await uploadDiveImage(id, imageFile)
          const uploadData = updatedDiveFromUpload?.data ? updatedDiveFromUpload.data : updatedDiveFromUpload
          if (uploadData?.imagePath) currentDiveState.imagePath = uploadData.imagePath
        } catch (uploadErr) {
          console.error(uploadErr)
        }
      }

      const payload = {}
      Object.entries(currentDiveState).forEach(([key, value]) => {
        if ((key === "latitude" || key === "longitude") && (value === "" || value == null)) return
        const numberFields = ["depthMeters", "durationMinutes", "waterTemperatureCelsius", "visibilityMeters", "weightKg", "pressureStartBar", "pressureEndBar"]
        if (numberFields.includes(key) && value !== "" && value !== null) {
          payload[key] = value.toString().includes(".") ? parseFloat(value) : parseInt(value, 10)
          return
        }
        if (key === "diver" || key === "authorities") return
        if (value !== undefined && value !== null) payload[key] = value
      })

      const res = await updateDive(id, payload)
      const backendData = res?.data ? res.data : res
      const freshImagePath = backendData?.imagePath || currentDiveState.imagePath

      setDive(prev => ({ ...prev, ...payload, imagePath: freshImagePath }))
      setFormData(prev => ({ ...prev, ...payload, imagePath: freshImagePath }))
      setIsEditing(false)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleImageChange(file) {
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  if (!dive || !formData) return <div className="dive-detail-page" style={{textAlign:"center", paddingTop:"120px"}}><p>Loading...</p></div>

  return (
    <div className="dive-detail-page">
      <button className="back-dashboard-global-btn" onClick={() => navigate("/")}>← Back to Dashboard</button>
      <div className="dive-hero">
        <img src={imagePreview || (dive.imagePath ? dive.imagePath : "https://placehold.co/600x400?text=Dive")} alt="Dive view" />
        {isEditing && (
          <label className="image-upload-btn">📷 Change image
            <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} />
          </label>
        )}
        <div className="hero-overlay">
          {isEditing ? (
            <input className="hero-title-input" value={formData.diveTitle || ""} onChange={(e) => setFormData((p) => ({ ...p, diveTitle: e.target.value }))} />
          ) : (
            <h1>{dive.diveTitle || "Uncharted Log Entry"}</h1>
          )}
          <p><MapPin size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} /> {dive.location || "Unknown Coordinates"}</p>
        </div>
      </div>
      <div className="dive-grid-info">
        <div className="info-card">
          <h3>Core Dive</h3>
          <EditableRow editing={isEditing} icon={Calendar} label="Date" name="date" value={formData.date} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <div className="info-row">
            <div className="info-row-left"><MapPin size={16} /><span className="label">Location:</span></div>
            {isEditing ? (
              <div style={{ position: "relative", flex: 1, width: "100%" }}>
                <input className="info-row-input" value={formData.location || ""} onChange={(e) => { setFormData((p) => ({ ...p, location: e.target.value })); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions">
                    {suggestions.map((s) => (
                      <div key={s.place_id} className="suggestion-item" onMouseDown={() => { setFormData(prev => ({ ...prev, location: s.display_name, latitude: parseFloat(s.lat), longitude: parseFloat(s.lon) })); setSuggestions([]); setShowSuggestions(false); }}>{s.display_name}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : <span className="value">{formData.location || "-"}</span>}
          </div>
          <EditableRow editing={isEditing} icon={ArrowDown} label="Depth" name="depthMeters" value={formData.depthMeters} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Timer} label="Duration" name="durationMinutes" value={formData.durationMinutes} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Compass} label="Type" name="diveType" value={formData.diveType} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
        </div>
        <div className="info-card">
          <h3>Conditions</h3>
          <EditableRow editing={isEditing} icon={Waves} label="Water" name="waterType" value={formData.waterType} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Thermometer} label="Temp" name="waterTemperatureCelsius" value={formData.waterTemperatureCelsius} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Eye} label="Visibility" name="visibilityMeters" value={formData.visibilityMeters} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Cloud} label="Weather" name="weather" value={formData.weather} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
        </div>
        <div className="info-card">
          <h3>Equipment</h3>
          <EditableRow editing={isEditing} icon={Shirt} label="Suit" name="suit" value={formData.suit} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={FlaskRound} label="Gas" name="gas" value={formData.gas} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Weight} label="Weight" name="weightKg" value={formData.weightKg} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Gauge} label="Start Pressure" name="pressureStartBar" value={formData.pressureStartBar} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Gauge} label="End Pressure" name="pressureEndBar" value={formData.pressureEndBar} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
        </div>
        <div className="info-card">
          <h3>People</h3>
          <EditableRow editing={isEditing} icon={User} label="Buddy" name="buddy" value={formData.buddy} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
          <EditableRow editing={isEditing} icon={Building} label="Dive Center" name="diveCenter" value={formData.diveCenter} onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))} isMetric={isMetric} />
        </div>
      </div>
      <button className="submit-btn" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
        {isEditing ? "Save Log Changes" : "Edit Parameters"}
      </button>
    </div>
  )
}