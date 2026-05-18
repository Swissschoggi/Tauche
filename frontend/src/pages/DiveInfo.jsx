import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getDiveById, updateDive } from "../api/diveApi"
import {
  Calendar, MapPin, ArrowDown, Timer, Compass, Thermometer,
  Eye, Waves, Cloud, Shirt, Weight, Gauge, User, Building,
  FlaskRound, FileText
} from "lucide-react"
import "./DiveInfo.css"

function InfoRow({ icon: Icon, label, value }) {
  return (
    <p className="info-row">
      <Icon size={16} />
      <span className="label">{label}:</span>
      <span className="value">{value ?? "-"}</span>
    </p>
  )
}

function EditableRow({ editing, icon: Icon, label, name, value, onChange }) {
  return (
    <div className="info-row">
      <Icon size={16} />
      <span className="label">{label}:</span>

      {editing ? (
        <input
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <span className="value">{value ?? "-"}</span>
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

  useEffect(() => {
    async function load() {
      const res = await getDiveById(id)
      if (!res?.data) return

      setDive(res.data)
      setFormData(res.data)
    }
    load()
  }, [id])

  async function handleSave() {
    try {
      const payload = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value ?? "")
      })

      if (imageFile) {
        payload.append("image", imageFile)
      }

      const res = await updateDive(id, payload)

      setDive(res.data ?? formData)
      setIsEditing(false)
      setImageFile(null)
      setImagePreview(null)

      console.log("Saved")
    } catch (err) {
      console.error("Save failed:", err)
    }
  }

  async function handleImageChange(file) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  if (!dive || !formData) return <div>Loading...</div>

  return (
    <div className="dive-detail-page">

      <button onClick={() => navigate(-1)}>← Back</button>

        <div className="dive-hero">

          <img
            src={
              imagePreview ||
              (dive.imagePath
                ? `http://localhost:8080${dive.imagePath}`
                : "https://placehold.co/600x400?text=Dive")
            }
          />

          {isEditing && (
            <label className="image-upload-btn">
              📷 Change image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageChange(e.target.files[0])}
              />
            </label>
          )}

          <div className="hero-overlay">
            {isEditing ? (
              <input
                value={formData.diveTitle || ""}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, diveTitle: e.target.value }))
                }
              />
            ) : (
              <h1>{dive.diveTitle}</h1>
            )}

            <p>{dive.location}</p>
          </div>
        </div>

      <div className="dive-grid-info">

        <div className="info-card">
          <h3>Core Dive</h3>

          <EditableRow editing={isEditing} icon={Calendar} label="Date"
            name="date" value={formData.date}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={MapPin} label="Location"
            name="location" value={formData.location}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={ArrowDown} label="Depth"
            name="depthMeters" value={formData.depthMeters}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Timer} label="Duration"
            name="durationMinutes" value={formData.durationMinutes}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Compass} label="Type"
            name="diveType" value={formData.diveType}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />
        </div>

        <div className="info-card">
          <h3>Conditions</h3>

          <EditableRow editing={isEditing} icon={Waves} label="Water"
            name="waterType" value={formData.waterType}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Thermometer} label="Temp"
            name="waterTemperatureCelsius" value={formData.waterTemperatureCelsius}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Eye} label="Visibility"
            name="visibilityMeters" value={formData.visibilityMeters}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Cloud} label="Weather"
            name="weather" value={formData.weather}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />
        </div>

        <div className="info-card">
          <h3>Equipment</h3>

          <EditableRow editing={isEditing} icon={Shirt} label="Suit"
            name="suit" value={formData.suit}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={FlaskRound} label="Gas"
            name="gas" value={formData.gas}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Weight} label="Weight"
            name="weightKg" value={formData.weightKg}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Gauge} label="Start Pressure"
            name="pressureStartBar" value={formData.pressureStartBar}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Gauge} label="End Pressure"
            name="pressureEndBar" value={formData.pressureEndBar}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />
        </div>

        <div className="info-card">
          <h3>People</h3>

          <EditableRow editing={isEditing} icon={User} label="Buddy"
            name="buddy" value={formData.buddy}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />

          <EditableRow editing={isEditing} icon={Building} label="Dive Center"
            name="diveCenter" value={formData.diveCenter}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />
        </div>

        <div className="info-card full">
          <h3>Notes</h3>

          <EditableRow editing={isEditing} icon={FileText} label="Notes"
            name="notes" value={formData.notes}
            onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))}
          />
        </div>
      </div>

      <button onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
        {isEditing ? "Save" : "Edit"}
      </button>

    </div>
  )
}