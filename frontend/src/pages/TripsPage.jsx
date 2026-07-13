import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllDives, getEquipmentCloset } from '../api/diveApi'
import {
  MapPin, Calendar, Plus, ChevronRight, Anchor, X,
  Clock, Thermometer, Waves, Users, Edit2, Trash2,
  Search, ArrowDown, Camera, Wind, Save, FileText,
  CheckCircle2, AlertCircle, DollarSign, Cloud
} from 'lucide-react'
import './TripsPage.css'

const STORAGE_KEY = 'tauche_trips_v1'

function loadTrips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const EMPTY_TRIP = {
  name: '',
  destination: '',
  latitude: null,
  longitude: null,
  startDate: '',
  endDate: '',
  notes: '',
  diveLogIds: [],
  coverColor: '#0077b6',
  status: 'planning',
  diveBuddies: [],
  gearPacked: [],
  budget: { currency: 'USD', total: 0, spent: 0 },
  weatherNotes: '',
  itinerary: [],
}

function generateItineraryDays(startDate, endDate) {
  if (!startDate) return []
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date(start)
  const days = []
  let cursor = new Date(start)
  let dayNum = 1
  while (cursor <= end) {
    const dateStr = cursor.toISOString().substring(0, 10)
    days.push({
      day: dayNum,
      date: dateStr,
      activities: '',
      diveSites: [],
      conditions: '',
      accommodation: '',
    })
    cursor.setDate(cursor.getDate() + 1)
    dayNum++
  }
  return days
}

const COLOR_PALETTE = [
  '#0077b6', '#023e8a', '#48cae4', '#00b4d8',
  '#2d6a4f', '#40916c', '#7f4f24', '#9c6644',
  '#7b2d8b', '#c9184a', '#e85d04', '#f48c06',
]

export default function TripsPage() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState(loadTrips)
  const [allDives, setAllDives] = useState([])
  const [allEquipment, setAllEquipment] = useState([])
  const [view, setView] = useState('list') // 'list' | 'detail' | 'form'
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [formData, setFormData] = useState(EMPTY_TRIP)
  const [formMode, setFormMode] = useState('create') // 'create' | 'edit'
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const locationTimeoutRef = useRef(null)

  useEffect(() => {
    getAllDives().then(d => setAllDives(Array.isArray(d) ? d : [])).catch(() => {})
    getEquipmentCloset().then(e => setAllEquipment(Array.isArray(e) ? e : [])).catch(() => {})
  }, [])

  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  // Location autocomplete
  useEffect(() => {
    if (!formData.destination || formData.destination.trim().length < 3) {
      setLocationSuggestions([])
      return
    }
    if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current)
    locationTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.destination)}&format=json&limit=5`
        )
        const data = await res.json()
        setLocationSuggestions(data)
      } catch {
        setLocationSuggestions([])
      }
    }, 400)
    return () => { if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current) }
  }, [formData.destination])

  const openCreate = () => {
    setFormData(EMPTY_TRIP)
    setFormMode('create')
    setFormError('')
    setView('form')
  }

  const openEdit = (trip, e) => {
    e?.stopPropagation()
    setFormData({ ...trip })
    setFormMode('edit')
    setFormError('')
    setView('form')
  }

  const openDetail = (trip) => {
    setSelectedTrip(trip)
    setView('detail')
  }

  const handleDelete = (tripId, e) => {
    e?.stopPropagation()
    if (!window.confirm('Delete this trip?')) return
    setTrips(prev => prev.filter(t => t.id !== tripId))
    if (selectedTrip?.id === tripId) setView('list')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.name?.trim()) { setFormError('Trip name is required.'); return }
    if (!formData.destination?.trim()) { setFormError('Destination is required.'); return }
    if (!formData.startDate) { setFormError('Start date is required.'); return }
    setSaving(true)
    setTimeout(() => {
      if (formMode === 'create') {
        const newTrip = { ...formData, id: generateId(), createdAt: new Date().toISOString() }
        setTrips(prev => [newTrip, ...prev])
        setSelectedTrip(newTrip)
        setView('detail')
      } else {
        setTrips(prev => prev.map(t => t.id === formData.id ? { ...formData } : t))
        setSelectedTrip({ ...formData })
        setView('detail')
      }
      setSaving(false)
    }, 300)
  }

  const toggleDiveInTrip = (diveId) => {
    setFormData(prev => ({
      ...prev,
      diveLogIds: prev.diveLogIds.includes(diveId)
        ? prev.diveLogIds.filter(id => id !== diveId)
        : [...prev.diveLogIds, diveId]
    }))
  }

  const addDiveBuddy = () => {
    setFormData(prev => ({
      ...prev,
      diveBuddies: [...(prev.diveBuddies || []), { id: generateId(), name: '', role: 'buddy' }]
    }))
  }

  const removeDiveBuddy = (buddyId) => {
    setFormData(prev => ({
      ...prev,
      diveBuddies: (prev.diveBuddies || []).filter(b => b.id !== buddyId)
    }))
  }

  const updateDiveBuddy = (buddyId, field, value) => {
    setFormData(prev => ({
      ...prev,
      diveBuddies: (prev.diveBuddies || []).map(b =>
        b.id === buddyId ? { ...b, [field]: value } : b
      )
    }))
  }

  const toggleGearItem = (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      gearPacked: (prev.gearPacked || []).includes(equipmentId)
        ? (prev.gearPacked || []).filter(id => id !== equipmentId)
        : [...(prev.gearPacked || []), equipmentId]
    }))
  }

  // Auto-generate itinerary days when dates change
  useEffect(() => {
    if (formData.startDate && view === 'form') {
      const newDays = generateItineraryDays(formData.startDate, formData.endDate)
      setFormData(prev => {
        if (JSON.stringify(prev.itinerary) === JSON.stringify(newDays)) return prev
        if (prev.itinerary.length === 0) return { ...prev, itinerary: newDays }
        const merged = newDays.map(nd => {
          const existing = prev.itinerary.find(i => i.date === nd.date)
          return existing || nd
        })
        return { ...prev, itinerary: merged }
      })
    }
  }, [formData.startDate, formData.endDate, view])

  const tripDives = (trip) => allDives.filter(d => trip?.diveLogIds?.includes(d.id))

  const tripNights = (trip) => {
    if (!trip.startDate || !trip.endDate) return null
    const diff = (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.round(diff))
  }

  const filteredTrips = trips.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ──────────────────────────────────────
  // FORM VIEW
  // ──────────────────────────────────────
  if (view === 'form') {
    return (
      <div className="trips-page">
        <button className="back-dashboard-global-btn" onClick={() => setView(formMode === 'edit' ? 'detail' : 'list')}>
          ← {formMode === 'edit' ? 'Cancel Edit' : 'Back'}
        </button>

        <div className="trips-form-wrapper">
          <div className="trips-form-card">
            <div className="trips-form-header">
              <h2>{formMode === 'create' ? '✈️ Plan New Trip' : '✏️ Edit Trip'}</h2>
              <p>Document your dive expedition details</p>
            </div>

            {formError && <div className="trips-form-error">{formError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="trips-form-section">
                <label>Trip Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="trips-input"
                  placeholder="e.g. Palau Coral Gardens 2025"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="trips-form-section">
                <label>Destination <span className="req">*</span></label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} className="trips-input-icon" />
                  <input
                    type="text"
                    className="trips-input trips-input-icon-left"
                    placeholder="Search location..."
                    value={formData.destination}
                    onChange={e => { setFormData(p => ({ ...p, destination: e.target.value })); setShowSuggestions(true) }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="trips-suggestions">
                      {locationSuggestions.map(s => (
                        <div
                          key={s.place_id}
                          className="trips-suggestion-item"
                          onMouseDown={() => {
                            setFormData(p => ({
                              ...p,
                              destination: s.display_name,
                              latitude: parseFloat(s.lat),
                              longitude: parseFloat(s.lon),
                            }))
                            setLocationSuggestions([])
                            setShowSuggestions(false)
                          }}
                        >
                          <MapPin size={12} style={{ color: '#38bdf8', flexShrink: 0 }} />
                          <span>{s.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="trips-form-row">
                <div className="trips-form-section">
                  <label>Start Date <span className="req">*</span></label>
                  <input
                    type="date"
                    className="trips-input"
                    value={formData.startDate}
                    onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="trips-form-section">
                  <label>End Date</label>
                  <input
                    type="date"
                    className="trips-input"
                    value={formData.endDate}
                    onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                    min={formData.startDate}
                  />
                </div>
              </div>

              <div className="trips-form-section">
                <label>Color Tag</label>
                <div className="trips-color-palette">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`trips-color-swatch ${formData.coverColor === color ? 'active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setFormData(p => ({ ...p, coverColor: color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="trips-form-section">
                <label>Trip Status</label>
                <div className="trips-status-selector">
                  {[
                    { value: 'planning', label: 'Planning', icon: AlertCircle },
                    { value: 'active', label: 'Active', icon: Waves },
                    { value: 'completed', label: 'Completed', icon: CheckCircle2 }
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <button
                        key={s.value}
                        type="button"
                        className={`trips-status-btn ${formData.status === s.value ? 'active' : ''}`}
                        onClick={() => setFormData(p => ({ ...p, status: s.value }))}
                      >
                        <Icon size={14} />
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="trips-form-section">
                <label>Link Dive Logs</label>
                <p className="trips-form-hint">Select dives from your logbook to attach to this trip</p>
                <div className="trips-dive-picker">
                  {allDives.length === 0 ? (
                    <p className="trips-empty-hint">No dives logged yet</p>
                  ) : allDives.map(dive => {
                    const selected = formData.diveLogIds.includes(dive.id)
                    return (
                      <div
                        key={dive.id}
                        className={`trips-dive-pick-row ${selected ? 'selected' : ''}`}
                        onClick={() => toggleDiveInTrip(dive.id)}
                      >
                        <div className={`trips-dive-check ${selected ? 'checked' : ''}`}>
                          {selected && '✓'}
                        </div>
                        <div className="trips-dive-pick-info">
                          <span className="trips-dive-pick-title">{dive.diveTitle || 'Untitled'}</span>
                          <span className="trips-dive-pick-meta">
                            {dive.date} · {dive.location?.split(',')[0]} · {dive.depthMeters}m
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="trips-form-section">
                <label>Dive Buddies <span className="trips-hint">(optional)</span></label>
                <p className="trips-form-hint">Track who you're diving with on this trip</p>
                <div className="trips-buddies-list">
                  {(formData.diveBuddies || []).map(buddy => (
                    <div key={buddy.id} className="trips-buddy-row">
                      <div className="trips-buddy-inputs">
                        <input
                          type="text"
                          placeholder="Buddy name"
                          className="trips-buddy-input"
                          value={buddy.name}
                          onChange={e => updateDiveBuddy(buddy.id, 'name', e.target.value)}
                        />
                        <select
                          className="trips-buddy-role"
                          value={buddy.role}
                          onChange={e => updateDiveBuddy(buddy.id, 'role', e.target.value)}
                        >
                          <option value="buddy">Buddy</option>
                          <option value="divemaster">Dive Master</option>
                          <option value="guide">Guide</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="trips-buddy-remove"
                        onClick={() => removeDiveBuddy(buddy.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="trips-btn-sm trips-btn-add"
                  onClick={addDiveBuddy}
                >
                  <Plus size={13} /> Add Buddy
                </button>
              </div>

              <div className="trips-form-section">
                <label>Gear Checklist <span className="trips-hint">(optional)</span></label>
                <p className="trips-form-hint">Select equipment from your closet to pack for this trip</p>
                {allEquipment.length === 0 ? (
                  <div className="trips-gear-empty">
                    <p>No equipment registered yet. Add gear in Equipment section first.</p>
                    <button 
                      type="button" 
                      className="trips-btn-sm" 
                      onClick={() => navigate('/equipment')}
                    >
                      Go to Equipment
                    </button>
                  </div>
                ) : (
                  <div className="trips-gear-selector">
                    {allEquipment.map(item => {
                      const isPacked = (formData.gearPacked || []).includes(item.id)
                      return (
                        <div
                          key={item.id}
                          className={`trips-gear-card ${isPacked ? 'packed' : ''}`}
                          onClick={() => toggleGearItem(item.id)}
                        >
                          <div className="trips-gear-card-check">
                            <input 
                              type="checkbox" 
                              checked={isPacked}
                              readOnly 
                            />
                          </div>
                          <div className="trips-gear-card-content">
                            <h4>{item.name}</h4>
                            <div className="trips-gear-card-meta">
                              <span className="trips-gear-category">{item.category}</span>
                              {item.manufacturer && <span>{item.manufacturer}</span>}
                            </div>
                          </div>
                          {item.requiresService && (
                            <div className="trips-gear-service-warning">⚠️</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="trips-form-section">
                <label>Day-by-Day Itinerary <span className="trips-hint">(optional)</span></label>
                <p className="trips-form-hint">Plan activities, dive sites, accommodation, and conditions for each day</p>
                <div className="trips-itinerary-editor">
                  {formData.itinerary.length === 0 ? (
                    <p className="trips-empty-hint">Set start and end dates above to generate a day-by-day plan</p>
                  ) : (
                    formData.itinerary.map((day, idx) => (
                      <div key={day.date} className="trips-itinerary-day">
                        <div className="trips-itinerary-day-header">
                          <span className="trips-itinerary-day-num">Day {day.day}</span>
                          <span className="trips-itinerary-day-date">{day.date}</span>
                        </div>
                        <div className="trips-itinerary-day-body">
                          <textarea
                            className="trips-textarea"
                            rows={2}
                            placeholder="Activities (e.g. Morning reef dive, afternoon wreck)"
                            value={day.activities}
                            onChange={e => {
                              const updated = [...formData.itinerary]
                              updated[idx] = { ...updated[idx], activities: e.target.value }
                              setFormData(p => ({ ...p, itinerary: updated }))
                            }}
                          />
                          <div className="trips-form-row" style={{ gap: 8 }}>
                            <input
                              type="text"
                              className="trips-input"
                              placeholder="Dive sites (comma separated)"
                              value={day.diveSites.join(', ')}
                              onChange={e => {
                                const updated = [...formData.itinerary]
                                updated[idx] = { ...updated[idx], diveSites: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                                setFormData(p => ({ ...p, itinerary: updated }))
                              }}
                            />
                            <input
                              type="text"
                              className="trips-input"
                              placeholder="Accommodation"
                              value={day.accommodation}
                              onChange={e => {
                                const updated = [...formData.itinerary]
                                updated[idx] = { ...updated[idx], accommodation: e.target.value }
                                setFormData(p => ({ ...p, itinerary: updated }))
                              }}
                            />
                          </div>
                          <input
                            type="text"
                            className="trips-input"
                            placeholder="Conditions (current, visibility, temp)"
                            value={day.conditions}
                            onChange={e => {
                              const updated = [...formData.itinerary]
                              updated[idx] = { ...updated[idx], conditions: e.target.value }
                              setFormData(p => ({ ...p, itinerary: updated }))
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="trips-form-section">
                <label>Budget & Costs <span className="trips-hint">(optional)</span></label>
                <div className="trips-form-row">
                  <div className="trips-form-section" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      placeholder="Total budget"
                      className="trips-input"
                      value={formData.budget?.total || ''}
                      onChange={e => setFormData(p => ({ ...p, budget: { ...p.budget, total: parseFloat(e.target.value) || 0 } }))}
                      min="0"
                      step="10"
                    />
                  </div>
                  <div className="trips-form-section" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      placeholder="Amount spent"
                      className="trips-input"
                      value={formData.budget?.spent || ''}
                      onChange={e => setFormData(p => ({ ...p, budget: { ...p.budget, spent: parseFloat(e.target.value) || 0 } }))}
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
              </div>

              <div className="trips-form-section">
                <label>Weather & Conditions <span className="trips-hint">(optional)</span></label>
                <textarea
                  className="trips-textarea"
                  rows={3}
                  placeholder="Expected conditions, water temp, visibility, currents, etc."
                  value={formData.weatherNotes}
                  onChange={e => setFormData(p => ({ ...p, weatherNotes: e.target.value }))}
                />
              </div>

              <div className="trips-form-section">
                <label>Notes</label>
                <textarea
                  className="trips-textarea"
                  rows={4}
                  placeholder="Gear list, accommodation, weather conditions, marine life observations..."
                  value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div className="trips-form-actions">
                <button
                  type="button"
                  className="trips-btn-secondary"
                  onClick={() => setView(formMode === 'edit' ? 'detail' : 'list')}
                >
                  Cancel
                </button>
                <button type="submit" className="trips-btn-primary" disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : formMode === 'create' ? 'Create Trip' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────
  // DETAIL VIEW
  // ──────────────────────────────────────
  if (view === 'detail' && selectedTrip) {
    const trip = trips.find(t => t.id === selectedTrip.id) || selectedTrip
    const dives = tripDives(trip)
    const nights = tripNights(trip)
    const maxDepth = dives.length ? Math.max(...dives.map(d => Number(d.depthMeters) || 0)) : null
    const totalMins = dives.reduce((s, d) => s + (Number(d.durationMinutes) || 0), 0)

    return (
      <div className="trips-page">
        <button className="back-dashboard-global-btn" onClick={() => setView('list')}>
          ← All Trips
        </button>

        <div className="trips-detail-wrapper">
          {/* Hero banner */}
          <div className="trips-detail-hero" style={{ background: `linear-gradient(135deg, ${trip.coverColor}cc, ${trip.coverColor}44)`, borderColor: `${trip.coverColor}66` }}>
            <div className="trips-detail-hero-top">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="trips-detail-badge" style={{ background: `${trip.coverColor}33`, borderColor: `${trip.coverColor}66` }}>
                  {dives.length} dive{dives.length !== 1 ? 's' : ''}
                </div>
                {trip.status && (
                  <div className={`trips-status-badge trips-status-${trip.status}`}>
                    {trip.status === 'planning' && <AlertCircle size={12} />}
                    {trip.status === 'active' && <Waves size={12} />}
                    {trip.status === 'completed' && <CheckCircle2 size={12} />}
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="trips-icon-btn" onClick={(e) => openEdit(trip, e)} title="Edit">
                  <Edit2 size={16} />
                </button>
                <button className="trips-icon-btn trips-icon-btn-danger" onClick={(e) => handleDelete(trip.id, e)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h1 className="trips-detail-title">{trip.name}</h1>
            <div className="trips-detail-meta">
              <span><MapPin size={14} /> {trip.destination?.split(',').slice(0, 2).join(',')}</span>
              {trip.startDate && <span><Calendar size={14} /> {trip.startDate}{trip.endDate ? ` → ${trip.endDate}` : ''}</span>}
              {nights !== null && <span><Clock size={14} /> {nights} night{nights !== 1 ? 's' : ''}</span>}
            </div>
          </div>

          {/* Stats strip */}
          {dives.length > 0 && (
            <div className="trips-stats-strip">
              <div className="trips-stat-box">
                <span className="trips-stat-val">{dives.length}</span>
                <span className="trips-stat-lbl">Dives</span>
              </div>
              {maxDepth && (
                <div className="trips-stat-box">
                  <span className="trips-stat-val" style={{ color: '#38bdf8' }}>{maxDepth}m</span>
                  <span className="trips-stat-lbl">Max Depth</span>
                </div>
              )}
              <div className="trips-stat-box">
                <span className="trips-stat-val" style={{ color: '#34d399' }}>{Math.round(totalMins / 60)}h {totalMins % 60}m</span>
                <span className="trips-stat-lbl">Bottom Time</span>
              </div>
            </div>
          )}

          {/* Dive Buddies */}
          {trip.diveBuddies && trip.diveBuddies.length > 0 && (
            <div className="trips-detail-section">
              <h3 className="trips-section-title">
                <Users size={16} style={{ color: '#38bdf8' }} /> Dive Buddies
              </h3>
              <div className="trips-buddies-detail">
                {trip.diveBuddies.map(buddy => (
                  <div key={buddy.id} className="trips-buddy-detail-card">
                    <div className="trips-buddy-detail-name">{buddy.name}</div>
                    <div className="trips-buddy-detail-role">{buddy.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gear Checklist */}
          {trip.gearPacked && trip.gearPacked.length > 0 && (
            <div className="trips-detail-section">
              <h3 className="trips-section-title">
                <CheckCircle2 size={16} style={{ color: '#34d399' }} /> Gear Checklist
              </h3>
              <div className="trips-gear-packed-display">
                {trip.gearPacked.map(gearId => {
                  const gear = allEquipment.find(g => g.id === gearId)
                  return gear ? (
                    <div key={gear.id} className="trips-gear-packed-card">
                      <div className="trips-gear-packed-icon">✓</div>
                      <div className="trips-gear-packed-info">
                        <h5>{gear.name}</h5>
                        <p>{gear.category}</p>
                      </div>
                      {gear.requiresService && (
                        <div className="trips-service-warning" title="Needs service">⚠️</div>
                      )}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Budget */}
          {trip.budget && (trip.budget.total > 0 || trip.budget.spent > 0) && (
            <div className="trips-detail-section">
              <h3 className="trips-section-title">
                <DollarSign size={16} style={{ color: '#f59e0b' }} /> Budget
              </h3>
              <div className="trips-budget-display">
                <div className="trips-budget-row">
                  <span className="trips-budget-label">Total Budget:</span>
                  <span className="trips-budget-value">{trip.budget.currency} {trip.budget.total.toFixed(2)}</span>
                </div>
                <div className="trips-budget-row">
                  <span className="trips-budget-label">Spent:</span>
                  <span className={`trips-budget-value ${trip.budget.spent > trip.budget.total ? 'over' : ''}`}>
                    {trip.budget.currency} {trip.budget.spent.toFixed(2)}
                  </span>
                </div>
                {trip.budget.total > 0 && (
                  <div className="trips-budget-bar">
                    <div
                      className="trips-budget-bar-fill"
                      style={{
                        width: `${Math.min(100, (trip.budget.spent / trip.budget.total) * 100)}%`,
                        backgroundColor: trip.budget.spent > trip.budget.total ? '#ef4444' : '#34d399'
                      }}
                    />
                  </div>
                )}
                {trip.budget.total > 0 && (
                  <div className="trips-budget-row">
                    <span className="trips-budget-label">Remaining:</span>
                    <span className={`trips-budget-value ${trip.budget.spent > trip.budget.total ? 'over' : 'positive'}`}>
                      {trip.budget.currency} {(trip.budget.total - trip.budget.spent).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Weather & Conditions */}
          {trip.weatherNotes && (
            <div className="trips-detail-section">
              <h3 className="trips-section-title">
                <Cloud size={16} style={{ color: '#60a5fa' }} /> Conditions
              </h3>
              <div className="trips-notes-body">{trip.weatherNotes}</div>
            </div>
          )}

          {/* Day-by-Day Itinerary */}
          {trip.itinerary && trip.itinerary.length > 0 && (
            <div className="trips-detail-section">
              <h3 className="trips-section-title">
                <Calendar size={16} style={{ color: '#f59e0b' }} /> Itinerary
              </h3>
              <div className="trips-itinerary-display">
                {trip.itinerary.map(day => (
                  <div key={day.date} className="trips-itinerary-card">
                    <div className="trips-itinerary-card-header">
                      <span className="trips-itinerary-card-day">Day {day.day}</span>
                      <span className="trips-itinerary-card-date">{day.date}</span>
                    </div>
                    {day.activities && <p className="trips-itinerary-card-text">{day.activities}</p>}
                    <div className="trips-itinerary-card-meta">
                      {day.diveSites.length > 0 && (
                        <span><MapPin size={11} /> {day.diveSites.join(', ')}</span>
                      )}
                      {day.accommodation && (
                        <span><Calendar size={11} /> {day.accommodation}</span>
                      )}
                      {day.conditions && (
                        <span><Cloud size={11} /> {day.conditions}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dive log list */}
          <div className="trips-detail-section">
            <h3 className="trips-section-title">
              <Anchor size={16} style={{ color: '#38bdf8' }} /> Dive Logs
              <button className="trips-btn-sm" onClick={() => openEdit(trip)}>
                <Plus size={13} /> Add
              </button>
            </h3>
            {dives.length === 0 ? (
              <div className="trips-empty-section">
                <p>No dives linked yet.</p>
                <button className="trips-btn-primary" style={{ marginTop: '12px' }} onClick={() => openEdit(trip)}>
                  <Plus size={15} /> Link Dive Logs
                </button>
              </div>
            ) : (
              <div className="trips-dive-list">
                {dives.map(dive => (
                  <div
                    key={dive.id}
                    className="trips-dive-row"
                    onClick={() => navigate(`/dives/${dive.id}`)}
                  >
                    <div className="trips-dive-row-left">
                      <div className="trips-dive-depth-badge">{dive.depthMeters || '?'}m</div>
                      <div>
                        <div className="trips-dive-row-title">{dive.diveTitle || 'Untitled'}</div>
                        <div className="trips-dive-row-meta">
                          <span><MapPin size={11} /> {dive.location?.split(',')[0]}</span>
                          <span><Calendar size={11} /> {dive.date}</span>
                          {dive.durationMinutes && <span><Clock size={11} /> {dive.durationMinutes} min</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: '#475569' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {trip.notes && (
            <div className="trips-detail-section">
              <h3 className="trips-section-title">
                <FileText size={16} style={{ color: '#38bdf8' }} /> Notes
              </h3>
              <div className="trips-notes-body">{trip.notes}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────
  // LIST VIEW
  // ──────────────────────────────────────
  return (
    <div className="trips-page">
      <button className="back-dashboard-global-btn" onClick={() => navigate('/')}>
        ← Dashboard
      </button>

      <div className="trips-list-wrapper">
        <div className="trips-list-header">
          <div>
            <h2 className="trips-list-title">
              <Anchor size={24} style={{ color: '#38bdf8' }} /> My Trips
            </h2>
            <p className="trips-list-subtitle">Plan and track your dive expeditions</p>
          </div>
          <button className="trips-btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Trip
          </button>
        </div>

        <div className="trips-search-bar">
          <Search size={15} style={{ color: '#64748b', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {trips.length === 0 ? (
          <div className="trips-empty-state">
            <Anchor size={48} strokeWidth={1} style={{ color: '#334155', marginBottom: '16px' }} />
            <p>No trips yet</p>
            <small>Create your first trip to organize dives by expedition</small>
            <button className="trips-btn-primary" style={{ marginTop: '20px' }} onClick={openCreate}>
              <Plus size={15} /> Plan First Trip
            </button>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="trips-empty-state">
            <Search size={32} strokeWidth={1} style={{ color: '#334155', marginBottom: '12px' }} />
            <p>No trips match "{searchTerm}"</p>
          </div>
        ) : (
          <div className="trips-grid">
            {filteredTrips.map(trip => {
              const dives = tripDives(trip)
              const nights = tripNights(trip)
              return (
                <div key={trip.id} className="trips-card" onClick={() => openDetail(trip)}>
                  <div className="trips-card-stripe" style={{ background: trip.coverColor }} />
                  <div className="trips-card-body">
                    <div className="trips-card-header">
                      <div className="trips-card-badge" style={{ background: `${trip.coverColor}22`, color: trip.coverColor, borderColor: `${trip.coverColor}44` }}>
                        {dives.length} dive{dives.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="trips-icon-btn-sm" onClick={e => openEdit(trip, e)} title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button className="trips-icon-btn-sm trips-icon-btn-danger" onClick={e => handleDelete(trip.id, e)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <h3 className="trips-card-title">{trip.name}</h3>
                    <div className="trips-card-dest">
                      <MapPin size={12} /> {trip.destination?.split(',').slice(0, 2).join(',')}
                    </div>
                    <div className="trips-card-footer">
                      {trip.startDate && (
                        <span className="trips-card-meta"><Calendar size={11} /> {trip.startDate}</span>
                      )}
                      {nights !== null && (
                        <span className="trips-card-meta"><Clock size={11} /> {nights}n</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="trips-card-arrow" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}