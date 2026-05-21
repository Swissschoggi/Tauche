import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getEquipmentCloset, addEquipmentItem, removeEquipmentItem } from "../api/diveApi"
import { ShieldAlert, CheckCircle, Settings, Plus, Trash2, Calendar, HardDrive } from "lucide-react"
import "./EquipmentPage.css"

export default function EquipmentPage() {
  const navigate = useNavigate()
  const [gear, setGear] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "", category: "Regulator", serialNumber: "",
    purchaseDate: "", lastServiceDate: "",
    serviceIntervalDives: 100, serviceIntervalMonths: 12, notes: ""
  })

async function loadCloset() {
  try {
    const res = await getEquipmentCloset()
    setGear(Array.isArray(res) ? res : [])
  } catch (err) {
    console.error("Failed fetching equipment profiles: ", err)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadCloset()
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newItem.name || !newItem.lastServiceDate) return
    try {
      await addEquipmentItem(newItem)
      setShowAddModal(false)
      setNewItem({
        name: "", category: "Regulator", serialNumber: "",
        purchaseDate: "", lastServiceDate: "",
        serviceIntervalDives: 100, serviceIntervalMonths: 12, notes: ""
      })
      loadCloset()
    } catch (err) {
      alert("Error logging equipment item.")
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Retire this gear item from active use track?")) return
    try {
      await removeEquipmentItem(id)
      loadCloset()
    } catch (err) {
      alert("Error removing item.")
    }
  }

  if (loading) {
    return (
      <div className="equipment-loading">
        <div className="equipment-spinner" />
        <p>Inspecting life support inventory tolerances...</p>
      </div>
    )
  }

  return (
    <div className="equipment-page">
      <div className="equipment-controls">
        <button className="equipment-back-btn" onClick={() => navigate("/")}>← Back to Dashboard</button>
        <button className="equipment-add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Life Support Gear
        </button>
      </div>

      <div className="equipment-document">
        <div className="equipment-section-header">
          <span className="equipment-section-num">INV</span>
          <h2>Locker & Life Support Systems</h2>
        </div>

        {gear.length === 0 ? (
          <div className="empty-equipment-state">
            <HardDrive size={32} />
            <p>No logged life support gear found. Register your equipment to monitor safe usage parameters.</p>
          </div>
        ) : (
          <div className="equipment-cards-layout">
            {gear.map((item) => {
              const remainingDives = item.serviceIntervalDives - item.divesSinceLastService
              const diveRatio = Math.max(0, Math.min(item.divesSinceLastService / item.serviceIntervalDives, 1))
              
              let statusColor = "#22c55e"
              let statusLabel = "Good to Dive"
              let statusIcon = <CheckCircle size={14} />

              if (item.requiresService) {
                statusColor = "#ef4444"
                statusLabel = "Service Overdue"
                statusIcon = <ShieldAlert size={14} />
              } else if (diveRatio >= 0.8 || item.daysRemainingUntilService <= 30) {
                statusColor = "#eab308"
                statusLabel = "Service Due"
                statusIcon = <Settings size={14} />
              }

              return (
                <div key={item.id} className="equipment-badge-card">
                  <div className="equipment-badge-header">
                    <span className="equipment-category-tag">{item.category}</span>
                    <span className="equipment-status-pill" style={{ backgroundColor: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                      {statusIcon} {statusLabel}
                    </span>
                    <button className="equipment-delete-btn" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="equipment-badge-body">
                    <h4>{item.name}</h4>
                    {item.serialNumber && <p className="equipment-sn">S/N: {item.serialNumber}</p>}
                    
                    <div className="equipment-stats-row">
                      <div>
                        <small>Total Dives</small>
                        <strong>{item.totalDivesWithGear}</strong>
                      </div>
                      <div>
                        <small>Bottom Time</small>
                        <strong>{Math.round(item.totalMinutesWithGear / 60)}h</strong>
                      </div>
                      <div>
                        <small>Since Service</small>
                        <strong style={{ color: item.requiresService ? "#ef4444" : "#cbd5e1" }}>
                          {item.divesSinceLastService}d
                        </strong>
                      </div>
                    </div>

                    <div className="equipment-progress-container">
                      <div className="equipment-progress-labels">
                        <span>Service Threshold Limit</span>
                        <span>{item.divesSinceLastService} / {item.serviceIntervalDives} Dives</span>
                      </div>
                      <div className="equipment-progress-track">
                        <div className="equipment-progress-fill" style={{ width: `${diveRatio * 100}%`, backgroundColor: statusColor }} />
                      </div>
                    </div>
                  </div>

                  <div className="equipment-meta-row">
                    <span><Calendar size={12} /> Expiry: {item.daysRemainingUntilService} Days left</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="equipment-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="equipment-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Register Life Support Gear</h3>
            <form onSubmit={handleAdd}>
              <div className="equipment-form-group">
                <label>Gear Model Identity Name</label>
                <input type="text" placeholder="e.g. Apeks XTX200 Regulator" value={newItem.name} onChange={(e) => setNewItem(p => ({ ...p, name: e.target.value }))} required />
              </div>

              <div className="equipment-form-group">
                <label>Category System</label>
                <select value={newItem.category} onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))}>
                  <option value="Regulator">Regulator Set</option>
                  <option value="BCD">BCD Jacket / Wing</option>
                  <option value="Computer">Dive Computer</option>
                  <option value="Cylinder">Cylinder Tank</option>
                  <option value="Suit">Exposure Suit</option>
                </select>
              </div>

              <div className="equipment-form-group">
                <label>Serial Number (S/N)</label>
                <input type="text" placeholder="Optional Manufacturer Reference" value={newItem.serialNumber} onChange={(e) => setNewItem(p => ({ ...p, serialNumber: e.target.value }))} />
              </div>

              <div className="equipment-form-group-split">
                <div className="equipment-form-group">
                  <label>Last Service Verification</label>
                  <input type="date" value={newItem.lastServiceDate} onChange={(e) => setNewItem(p => ({ ...p, lastServiceDate: e.target.value }))} required />
                </div>
                <div className="equipment-form-group">
                  <label>Service Limit (Dives)</label>
                  <input type="number" value={newItem.serviceIntervalDives} onChange={(e) => setNewItem(p => ({ ...p, serviceIntervalDives: parseInt(e.target.value) || 100 }))} />                </div>
              </div>

              <div className="equipment-modal-actions">
                <button type="button" className="equipment-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="equipment-btn-primary">Save to Closet Locker</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}