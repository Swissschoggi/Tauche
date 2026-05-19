import React from "react"
import { Navigate, useLocation } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  
  const isAuthenticated = !!localStorage.getItem("user_session_token")

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}