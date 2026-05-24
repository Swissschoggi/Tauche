import { useState, useEffect } from 'react'

export const useDiveSites = () => {
  const [sites, setSites] = useState(() => {
    const saved = localStorage.getItem('dive_sites_db')
    return saved ? JSON.parse(saved) : []
  })
  
  const [favoriteSites, setFavoriteSites] = useState(() => {
    const saved = localStorage.getItem('favorite_sites')
    return saved ? JSON.parse(saved) : []
  })

  const importFromDives = (dives) => {
    if (!dives || dives.length === 0) return
    
    const locationMap = new Map()
    
    dives.forEach(dive => {
      if (!dive.location) return
      
      const locationKey = dive.location.toLowerCase().trim()
      
      if (locationMap.has(locationKey)) {
        const existing = locationMap.get(locationKey)
        existing.diveCount++
        existing.avgDepth = (existing.avgDepth + (Number(dive.depthMeters) || 0)) / existing.diveCount
        if (dive.date && new Date(dive.date) > new Date(existing.lastVisited)) {
          existing.lastVisited = dive.date
        }
      } else {
        locationMap.set(locationKey, {
          id: Date.now() + Math.random() * 1000,
          name: dive.location.split(',')[0] || dive.location,
          location: dive.location,
          diveCount: 1,
          avgDepth: Number(dive.depthMeters) || 0,
          firstVisit: dive.date || new Date().toISOString(),
          lastVisited: dive.date || new Date().toISOString(),
          notes: dive.notes ? [{ text: dive.notes, date: dive.date || new Date().toISOString() }] : [],
          conditions: []
        })
      }
    })
    
    const newSites = Array.from(locationMap.values())
    
    setSites(prev => {
      const existingMap = new Map(prev.map(s => [s.location?.toLowerCase().trim(), s]))
      
      newSites.forEach(newSite => {
        const existing = existingMap.get(newSite.location?.toLowerCase().trim())
        if (existing) {
          existing.diveCount = Math.max(existing.diveCount, newSite.diveCount)
          existing.avgDepth = (existing.avgDepth + newSite.avgDepth) / 2
          if (new Date(newSite.lastVisited) > new Date(existing.lastVisited)) {
            existing.lastVisited = newSite.lastVisited
          }
        } else {
          existingMap.set(newSite.location?.toLowerCase().trim(), newSite)
        }
      })
      
      return Array.from(existingMap.values())
    })
  }
  
  const addSite = (site) => {
    setSites(prev => {
      const exists = prev.find(s => s.name === site.name || s.location === site.location)
      if (exists) {
        return prev.map(s => (s.name === site.name || s.location === site.location) ? 
          { 
            ...s, 
            lastVisited: new Date().toISOString(), 
            diveCount: (s.diveCount || 0) + 1,
            avgDepth: ((s.avgDepth || 0) * (s.diveCount || 0) + (site.depth || 0)) / ((s.diveCount || 0) + 1),
            notes: [...(s.notes || []), ...(site.notes || [])]
          } : s)
      }
      return [...prev, { 
        ...site, 
        id: Date.now(),
        diveCount: 1, 
        firstVisit: new Date().toISOString(),
        lastVisited: new Date().toISOString(),
        avgDepth: site.depth || 0,
        notes: site.notes || [],
        conditions: []
      }]
    })
  }
  
  const addSiteNote = (siteId, note) => {
    setSites(prev => prev.map(site => 
      site.id === siteId 
        ? { ...site, notes: [...(site.notes || []), { ...note, date: new Date().toISOString() }] }
        : site
    ))
  }
  
  const addSiteCondition = (siteId, condition) => {
    setSites(prev => prev.map(site => 
      site.id === siteId 
        ? { ...site, conditions: [...(site.conditions || []), { ...condition, date: new Date().toISOString() }] }
        : site
    ))
  }
  
  const toggleFavorite = (siteId) => {
    setFavoriteSites(prev => 
      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
    )
  }
  
  useEffect(() => {
    localStorage.setItem('dive_sites_db', JSON.stringify(sites))
  }, [sites])
  
  useEffect(() => {
    localStorage.setItem('favorite_sites', JSON.stringify(favoriteSites))
  }, [favoriteSites])
  
  return { sites, favoriteSites, addSite, addSiteNote, addSiteCondition, toggleFavorite, importFromDives }
}