import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getEquipmentCloset, addEquipmentItem, removeEquipmentItem, updateEquipmentItem } from "../api/diveApi"
import { ShieldAlert, CheckCircle, Settings, Plus, Trash2, Calendar, HardDrive, Edit, Save, X, Wrench, DollarSign, Hash, AlertTriangle } from "lucide-react"
import "./EquipmentPage.css"

export default function EquipmentPage() {
  const navigate = useNavigate()
  const [gear, setGear] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({
    name: "", category: "Regulator", serialNumber: "",
    purchaseDate: "", lastServiceDate: "",
    serviceIntervalDives: 100, serviceIntervalMonths: 12, notes: "",
    manufacturer: "", model: "", purchasePrice: "", lastServiceNotes: ""
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
        serviceIntervalDives: 100, serviceIntervalMonths: 12, notes: "",
        manufacturer: "", model: "", purchasePrice: "", lastServiceNotes: ""
      })
      loadCloset()
    } catch (err) {
      alert("Error logging equipment item.")
    }
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!editingItem.name || !editingItem.lastServiceDate) return
    try {
      await updateEquipmentItem(editingItem.id, editingItem)
      setEditingItem(null)
      loadCloset()
    } catch (err) {
      alert("Error updating equipment item.")
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

  function startEdit(item) {
    setEditingItem({ ...item })
  }

  function cancelEdit() {
    setEditingItem(null)
  }

  function updateEditingField(field, value) {
    setEditingItem(prev => ({ ...prev, [field]: value }))
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

              if (editingItem?.id === item.id) {
                return (
                  <div key={item.id} className="equipment-badge-card editing">
                    <form onSubmit={handleUpdate}>
                      <div className="equipment-badge-header">
                        <span className="equipment-category-tag">
                          <select value={editingItem.category} onChange={(e) => updateEditingField("category", e.target.value)} style={{ background: "transparent", color: "#90e0ef", border: "1px solid rgba(144,224,239,0.3)" }}>
                            <option value="Regulator">Regulator Set</option>
                            <option value="BCD">BCD Jacket / Wing</option>
                            <option value="Computer">Dive Computer</option>
                            <option value="Cylinder">Cylinder Tank</option>
                            <option value="Suit">Exposure Suit</option>
                            <option value="Light">Dive Light</option>
                            <option value="Rebreather">Rebreather</option>
                            <option value="Accessory">Accessory</option>
                          </select>
                        </span>
                        <div className="equipment-edit-actions">
                          <button type="submit" className="equipment-save-btn" title="Save"><Save size={14} /></button>
                          <button type="button" className="equipment-cancel-btn" onClick={cancelEdit} title="Cancel"><X size={14} /></button>
                        </div>
                      </div>

                      <div className="equipment-badge-body">
                        <input type="text" value={editingItem.name} onChange={(e) => updateEditingField("name", e.target.value)} className="equipment-edit-input" placeholder="Equipment Name" required />
                        
                        <div className="equipment-edit-row">
                          <div className="equipment-edit-field">
                            <label>Manufacturer</label>
                            <input type="text" value={editingItem.manufacturer || ""} onChange={(e) => updateEditingField("manufacturer", e.target.value)} placeholder="Manufacturer" />
                          </div>
                          <div className="equipment-edit-field">
                            <label>Model</label>
                            <input type="text" value={editingItem.model || ""} onChange={(e) => updateEditingField("model", e.target.value)} placeholder="Model" />
                          </div>
                        </div>

                        <div className="equipment-edit-row">
                          <div className="equipment-edit-field">
                            <label>Serial Number</label>
                            <input type="text" value={editingItem.serialNumber || ""} onChange={(e) => updateEditingField("serialNumber", e.target.value)} placeholder="Serial Number" />
                          </div>
                          <div className="equipment-edit-field">
                            <label>Purchase Price</label>
                            <input type="number" value={editingItem.purchasePrice || ""} onChange={(e) => updateEditingField("purchasePrice", e.target.value)} placeholder="Price" step="0.01" />
                          </div>
                        </div>

                        <div className="equipment-edit-row">
                          <div className="equipment-edit-field">
                            <label>Purchase Date</label>
                            <input type="date" value={editingItem.purchaseDate || ""} onChange={(e) => updateEditingField("purchaseDate", e.target.value)} />
                          </div>
                          <div className="equipment-edit-field">
                            <label>Last Service Date</label>
                            <input type="date" value={editingItem.lastServiceDate || ""} onChange={(e) => updateEditingField("lastServiceDate", e.target.value)} required />
                          </div>
                        </div>

                        <div className="equipment-edit-row">
                          <div className="equipment-edit-field">
                            <label>Service Interval (Dives)</label>
                            <input type="number" value={editingItem.serviceIntervalDives} onChange={(e) => updateEditingField("serviceIntervalDives", parseInt(e.target.value) || 100)} />
                          </div>
                          <div className="equipment-edit-field">
                            <label>Service Interval (Months)</label>
                            <input type="number" value={editingItem.serviceIntervalMonths} onChange={(e) => updateEditingField("serviceIntervalMonths", parseInt(e.target.value) || 12)} />
                          </div>
                        </div>

                        <div className="equipment-edit-field full-width">
                          <label>Service Notes</label>
                          <textarea value={editingItem.lastServiceNotes || ""} onChange={(e) => updateEditingField("lastServiceNotes", e.target.value)} placeholder="Notes about last service (what was done, technician, etc.)" rows="2" />
                        </div>

                        <div className="equipment-edit-field full-width">
                          <label>General Notes</label>
                          <textarea value={editingItem.notes || ""} onChange={(e) => updateEditingField("notes", e.target.value)} placeholder="Additional notes about this equipment" rows="2" />
                        </div>
                      </div>
                    </form>
                  </div>
                )
              }

              return (
                <div key={item.id} className="equipment-badge-card">
                  <div className="equipment-badge-header">
                    <span className="equipment-category-tag">{item.category}</span>
                    <span className="equipment-status-pill" style={{ backgroundColor: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                      {statusIcon} {statusLabel}
                    </span>
                    <div className="equipment-action-buttons">
                      <button className="equipment-edit-btn" onClick={() => startEdit(item)} title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="equipment-delete-btn" onClick={() => handleDelete(item.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="equipment-badge-body">
                    <h4>{item.name}</h4>
                    {item.manufacturer && <p className="equipment-meta"><Wrench size={12} /> {item.manufacturer} {item.model && `· ${item.model}`}</p>}
                    {item.serialNumber && <p className="equipment-sn"><Hash size={12} /> S/N: {item.serialNumber}</p>}
                    {item.purchasePrice && <p className="equipment-meta"><DollarSign size={12} /> ${parseFloat(item.purchasePrice).toLocaleString()}</p>}
                    
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

                    {item.daysRemainingUntilService <= 0 && (
                      <div className="equipment-service-warning">
                        <AlertTriangle size={12} /> Service is overdue!
                      </div>
                    )}
                  </div>

                  <div className="equipment-meta-row">
                    <span><Calendar size={12} /> Last Serviced: {item.lastServiceDate}</span>
                    {item.daysRemainingUntilService > 0 && (
                      <span>Expires in: {item.daysRemainingUntilService} days</span>
                    )}
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
                <label>Gear Model Identity Name *</label>
                <input type="text" placeholder="e.g. Apeks XTX200 Regulator" value={newItem.name} onChange={(e) => setNewItem(p => ({ ...p, name: e.target.value }))} required />
              </div>

              <div className="equipment-form-group-split">
                <div className="equipment-form-group">
                  <label>Manufacturer</label>
                  <input type="text" placeholder="e.g. Apeks, Scubapro, Shearwater" value={newItem.manufacturer} onChange={(e) => setNewItem(p => ({ ...p, manufacturer: e.target.value }))} />
                </div>
                <div className="equipment-form-group">
                  <label>Model</label>
                  <input type="text" placeholder="Model number" value={newItem.model} onChange={(e) => setNewItem(p => ({ ...p, model: e.target.value }))} />
                </div>
              </div>

              <div className="equipment-form-group">
                <label>Category System</label>
                <select value={newItem.category} onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))}>
                  <option value="Regulator">Regulator Set</option>
                  <option value="BCD">BCD Jacket / Wing</option>
                  <option value="Computer">Dive Computer</option>
                  <option value="Cylinder">Cylinder Tank</option>
                  <option value="Suit">Exposure Suit</option>
                  <option value="Light">Dive Light</option>
                  <option value="Rebreather">Rebreather</option>
                  <option value="Accessory">Accessory</option>
                </select>
              </div>

              <div className="equipment-form-group-split">
                <div className="equipment-form-group">
                  <label>Serial Number (S/N)</label>
                  <input type="text" placeholder="Optional Manufacturer Reference" value={newItem.serialNumber} onChange={(e) => setNewItem(p => ({ ...p, serialNumber: e.target.value }))} />
                </div>
                <div className="equipment-form-group">
                  <label>Purchase Price ($)</label>
                  <input type="number" placeholder="Amount" value={newItem.purchasePrice} onChange={(e) => setNewItem(p => ({ ...p, purchasePrice: e.target.value }))} step="0.01" />
                </div>
              </div>

              <div className="equipment-form-group-split">
                <div className="equipment-form-group">
                  <label>Purchase Date</label>
                  <input type="date" value={newItem.purchaseDate} onChange={(e) => setNewItem(p => ({ ...p, purchaseDate: e.target.value }))} />
                </div>
                <div className="equipment-form-group">
                  <label>Last Service Date *</label>
                  <input type="date" value={newItem.lastServiceDate} onChange={(e) => setNewItem(p => ({ ...p, lastServiceDate: e.target.value }))} required />
                </div>
              </div>

              <div className="equipment-form-group-split">
                <div className="equipment-form-group">
                  <label>Service Limit (Dives)</label>
                  <input type="number" value={newItem.serviceIntervalDives} onChange={(e) => setNewItem(p => ({ ...p, serviceIntervalDives: parseInt(e.target.value) || 100 }))} />
                </div>
                <div className="equipment-form-group">
                  <label>Service Limit (Months)</label>
                  <input type="number" value={newItem.serviceIntervalMonths} onChange={(e) => setNewItem(p => ({ ...p, serviceIntervalMonths: parseInt(e.target.value) || 12 }))} />
                </div>
              </div>

              <div className="equipment-form-group">
                <label>Last Service Notes</label>
                <textarea placeholder="What was done during last service? Technician name?" value={newItem.lastServiceNotes} onChange={(e) => setNewItem(p => ({ ...p, lastServiceNotes: e.target.value }))} rows="2" />
              </div>

              <div className="equipment-form-group">
                <label>General Notes</label>
                <textarea placeholder="Any additional notes about this equipment" value={newItem.notes} onChange={(e) => setNewItem(p => ({ ...p, notes: e.target.value }))} rows="2" />
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