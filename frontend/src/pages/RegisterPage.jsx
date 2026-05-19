import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../api/diveApi"
import "./LoginPage.css"

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function validateRegistration() {
    const { email, password, confirmPassword } = formData
    if (!email || !password || !confirmPassword) {
      return "All validation parameters are required."
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please provide a valid structured email address."
    }
    if (password.length < 6) {
      return "Security passwords must contain at least 6 characters."
    }
    if (password !== confirmPassword) {
      return "Password parameters do not match."
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    const validationError = validateRegistration()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const res = await registerUser(formData.email, formData.password)
      localStorage.setItem("user_session_token", res.data.token)
      navigate("/", { replace: true })
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Registration portal rejection."
      setError(serverMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-ambient-glow"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🤿</div>
          <h2>Create Diver Profile</h2>
          <p>Join the decentralized dive logbook network</p>
        </div>

        {error && <div className="login-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="email">Diver Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="diver@ocean.com"
              disabled={isLoading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Security Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? "Creating Profile..." : "Register Account →"}
          </button>
        </form>

        <div className="auth-switch-link">
          <span style={{ color: "var(--muted)" }}>Already have a profile? </span>
          <Link to="/login" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "600" }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}