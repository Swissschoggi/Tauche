import { useLocation, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, Map, BarChart3 } from 'lucide-react'

const primaryItems = [
  { label: 'Home',   path: '/',                icon: Home },
  { label: 'New',    path: '/new',             icon: PlusCircle },
  { label: 'Map',    path: '/map',             icon: Map },
  { label: 'Stats',  path: '/analytics',       icon: BarChart3 },
]

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="mobile-nav">
      {primaryItems.map(item => {
        const active = location.pathname === item.path
        return (
          <button
            key={item.path}
            className={`mobile-tab ${active ? 'mobile-tab--active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
