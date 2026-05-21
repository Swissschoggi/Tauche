import { useState, useEffect } from 'react'

export const useFavorites = () => {
  const [favoriteSites, setFavoriteSites] = useState(() => {
    const saved = localStorage.getItem('favorite_dive_sites')
    return saved ? JSON.parse(saved) : []
  })
  
  const [favoriteBuddies, setFavoriteBuddies] = useState(() => {
    const saved = localStorage.getItem('favorite_buddies')
    return saved ? JSON.parse(saved) : []
  })

  const toggleFavoriteSite = (siteName) => {
    if (!siteName) return
    setFavoriteSites(prev => 
      prev.includes(siteName) 
        ? prev.filter(s => s !== siteName)
        : [...prev, siteName]
    )
  }

  const toggleFavoriteBuddy = (buddyName) => {
    if (!buddyName) return
    setFavoriteBuddies(prev =>
      prev.includes(buddyName)
        ? prev.filter(b => b !== buddyName)
        : [...prev, buddyName]
    )
  }

  useEffect(() => {
    localStorage.setItem('favorite_dive_sites', JSON.stringify(favoriteSites))
  }, [favoriteSites])

  useEffect(() => {
    localStorage.setItem('favorite_buddies', JSON.stringify(favoriteBuddies))
  }, [favoriteBuddies])

  return { favoriteSites, favoriteBuddies, toggleFavoriteSite, toggleFavoriteBuddy }
}