import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createDive, updateDive, getDiveById } from "../api/diveApi"
import { diveFormSchema } from "../form/diveFormSchema"
import "./DiveFormPage.css"

export default function DiveFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({})

  // init empty form
  useEffect(() => {
    const emptyForm = {}

    diveFormSchema.forEach((field) => {
      emptyForm[field.name] = ""
    })

    setForm(emptyForm)
  }, [])

  // load edit data
  useEffect(() => {
    if (!id) return

    async function loadDive() {
      try {
        const res = await getDiveById(id)
        setForm(res.data || {})
      } catch (error) {
        console.error("Failed to load dive:", error)
      }
    }

    loadDive()
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      if (id) {
        await updateDive(id, form)
      } else {
        await createDive(form)
      }

      navigate("/")
    } catch (error) {
      console.error("Failed to save dive:", error)
    }
  }

  return (
    <div className="dive-form-page">
      <div className="card">
        <h2>{id ? "Edit Dive" : "New Dive"}</h2>

        <form onSubmit={handleSubmit}>
          {diveFormSchema.map((field) => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>

              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
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
                  type={field.type}
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}

          <button type="submit">
            {id ? "Update Dive" : "Create Dive"}
          </button>
        </form>
      </div>
    </div>
  )
}