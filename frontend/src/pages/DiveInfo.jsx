import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getDiveById } from "../api/diveApi"
import "./DiveInfo.css"
import {
  Calendar,
  MapPin,
  ArrowDown,
  Timer,
  Compass,
  Thermometer,
  Eye,
  Waves,
  Cloud,
  Shirt,
  Wind,
  Weight,
  Gauge,
  User,
  Building
} from "lucide-react"

function InfoRow({ icon: Icon, label, value }) {
  return (
    <p className="info-row">
      <Icon size={16} />
      <span className="label">{label}:</span>
      <span className="value">{value}</span>
    </p>
  )
}

export default function DiveInfo() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dive, setDive] = useState(null)

  useEffect(() => {
    async function load() {
      const res = await getDiveById(id)
      setDive(res.data)
    }
    load()
  }, [id])

  if (!dive) return <div className="loading">Loading...</div>

  return (
    <div className="dive-detail-page">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="dive-hero">
        <img
          src={
            dive.imagePath
              ? `http://localhost:8080${dive.imagePath}`
              : "https://placehold.co/600x400?text=Dive"
          }
        />

        <div className="hero-overlay">
          <h1>{dive.diveTitle}</h1>
          <p>{dive.location}</p>
        </div>
      </div>

      <div className="dive-grid-info">

        <div className="info-card">
          <h3>Core Dive</h3>

          <InfoRow icon={Calendar} label="Date" value={dive.date} />
          <InfoRow icon={MapPin} label="Location" value={dive.location} />
          <InfoRow icon={ArrowDown} label="Depth" value={`${dive.depthMeters} m`} />
          <InfoRow icon={Timer} label="Duration" value={`${dive.durationMinutes} min`} />
          <InfoRow icon={Compass} label="Type" value={dive.diveType} />
        </div>

        <div className="info-card">
          <h3>Conditions</h3>
          <p><b>Water:</b> {dive.waterType}</p>
          <p><b>Temp:</b> {dive.waterTemperatureCelsius} °C</p>
          <p><b>Visibility:</b> {dive.visibilityMeters} m</p>
          <p><b>Weather:</b> {dive.weather}</p>
        </div>

        <div className="info-card">
          <h3>Equipment</h3>
          <p><b>Suit:</b> {dive.suit}</p>
          <p><b>Gas:</b> {dive.gas}</p>
          <p><b>Weight:</b> {dive.weightKg} kg</p>
          <p><b>Tank:</b> {dive.pressureStartBar} → {dive.pressureEndBar} bar</p>
        </div>

        <div className="info-card">
          <h3>People</h3>
          <p><b>Buddy:</b> {dive.buddy}</p>
          <p><b>Dive Center:</b> {dive.diveCenter}</p>
        </div>

        <div className="info-card full">
          <h3>Notes</h3>
          <p>{dive.notes}</p>
        </div>

      </div>
    </div>
  )
}