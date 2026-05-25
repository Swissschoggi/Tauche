import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'New Dive', path: '/new' },
    { label: 'Map', path: '/map' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Equipment', path: '/equipment' },
    { label: 'Certifications', path: '/certification' },
    { label: 'Trips', path: '/trips' },
    { label: 'Profile', path: '/profile' }
  ]
  
  return (
    <nav className="mobile-nav">
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>
      {isOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <button 
              key={item.path}
              onClick={() => { navigate(item.path); setIsOpen(false) }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}