import React, { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { loginUser } from "../api/diveApi"
import "./LoginPage.css"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  function handleChange(e) {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await loginUser(credentials.email, credentials.password)
      localStorage.setItem("user_session_token", res.data.token)
      
      const originPath = location.state?.from?.pathname || "/"
      navigate(originPath, { replace: true })
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Wrong creds bro."
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
          <h2>Tauche Logbook</h2>
          <p>Sign in to access your decentralized dive logs</p>
        </div>

        {error && <div className="login-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="email">Diver Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
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
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? "Validating Session..." : "Secure Access →"}
          </button>
        </form>

        <div className="auth-switch-link">
          <span style={{ color: "var(--muted)" }}>New to Tauche Logbook? </span>
          <Link to="/register" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "600" }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}