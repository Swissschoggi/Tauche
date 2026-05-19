import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createDive, updateDive, getDiveById } from "../api/diveApi"
import { diveFormSchema } from "../form/diveFormSchema"
import { Settings } from "lucide-react"
import "./DiveFormPage.css"

export default function DiveFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const locationTimeoutRef = useRef(null)

  const [form, setForm] = useState(() => {
    const initialState = {}
    diveFormSchema.forEach((field) => {
      initialState[field.name] = ""
    })
    initialState.latitude = null
    initialState.longitude = null
    initialState.imagePath = null
    return initialState
  })

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    if (!id) return

    async function loadDive() {
      try {
        const res = await getDiveById(id)
        const sanitizedData = { ...res } 
        Object.keys(sanitizedData).forEach(key => {
          if (sanitizedData[key] === null) sanitizedData[key] = ""
        })
        setForm(prev => ({ ...prev, ...sanitizedData }))
      } catch (error) {
        console.error("Failed to recover target dive entity:", error)
        setFormError("Could not retrieve dive logs from the network.")
      }
    }

    loadDive()
  }, [id])

  useEffect(() => {
    if (!form.location || form.location.trim().length < 3) {
      setSuggestions([])
      return
    }

    if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current)

    locationTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.location)}&format=json&limit=5`
        )
        if (!response.ok) throw new Error("Network address lookup failure")
        const data = await response.json()
        setSuggestions(data)
      } catch (err) {
        console.error("Geocoding lookup timed out or failed:", err)
      }
    }, 400)

    return () => {
      if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current)
    }
  }, [form.location])

  function handleChange(e) {
    const { name, value, files } = e.target
    const fieldDefinition = diveFormSchema.find(f => f.name === name)

    let parsedValue = value

    if (files) {
      parsedValue = files[0]
    } else if (fieldDefinition?.type === "number" && value !== "") {
      parsedValue = value.includes(".") ? parseFloat(value) : parseInt(value, 10)
    }

    setForm((prev) => ({
      ...prev,
      [name]: parsedValue,
    }))
  }

  function processPayload() {
    const cleanData = {}

    Object.keys(form).forEach((key) => {
      const val = form[key]

      if (val === "" || val === undefined || val === null) {
        return
      }
      
      cleanData[key] = val
    })

    if (!id) {
      delete cleanData.id
    }

    return cleanData
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError("")
    setIsSubmitting(true)

    const payload = processPayload()

    if (!payload.diveTitle || !payload.date) {
      setFormError("Dive Title and Date parameters are required fields.")
      setIsSubmitting(false)
      return
    }

    try {
      if (id) {
        await updateDive(id, payload) 
      } else {
        await createDive(payload) 
      }
      navigate("/")
    } catch (error) {
      console.error("Failed validation saving sequence:", error)
      setFormError(error.response?.data?.message || "Data-layer persistence failure.")
    } finally {
      setIsSubmitting(false)
    }
  }

return (
  <div className="dive-form-page">
    <button className="back-dashboard-global-btn" onClick={() => navigate("/")}>
      ← Back to Dashboard
    </button>
    <button className="nav-settings-global-btn" onClick={() => navigate("/settings")}>
      <Settings size={16} /> Settings
    </button>
    <div className="card">
        <h2>{id ? "Edit Dive Log Entry" : "Log New Dive Sequence"}</h2>
        
        {formError && <div className="form-error-banner">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {diveFormSchema.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name}>{field.label}</label>

              {field.name === "location" ? (
                <div style={{ position: "relative" }}>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={form.location || ""}
                    onChange={(e) => {
                      handleChange(e)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    disabled={isSubmitting}
                    autoComplete="off"
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions">
                      {suggestions.map((s) => (
                        <div
                          key={s.place_id}
                          className="suggestion-item"
                          onMouseDown={() => {
                            setForm((prev) => ({
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
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  value={field.type === "file" ? undefined : form[field.name] || ""}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              )}
            </div>
          ))}

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Persisting Log Changes..." : id ? "Update Dive Log" : "Commit Dive Log"}
          </button>
        </form>
      </div>
    </div>
  )
}