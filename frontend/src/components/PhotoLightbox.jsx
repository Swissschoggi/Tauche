import { useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export default function PhotoLightbox({ photos, currentIndex, onClose, onNavigate }) {
  const photo = photos[currentIndex]

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1)
  }, [currentIndex, photos.length, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1)
  }, [currentIndex, onNavigate])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose, goNext, goPrev])

  if (!photo) return null

  return (
    <div className="photo-lightbox-pro" onClick={onClose}>
      <div className="plp-backdrop" />

      <button className="plp-close" onClick={onClose}>
        <X size={20} />
      </button>

      {currentIndex > 0 && (
        <button className="plp-nav plp-prev" onClick={(e) => { e.stopPropagation(); goPrev() }}>
          <ChevronLeft size={24} />
        </button>
      )}

      {currentIndex < photos.length - 1 && (
        <button className="plp-nav plp-next" onClick={(e) => { e.stopPropagation(); goNext() }}>
          <ChevronRight size={24} />
        </button>
      )}

      <div className="plp-image-wrap" onClick={(e) => e.stopPropagation()}>
        <img src={photo.url} alt="Dive gallery" className="plp-image" />
        <div className="plp-counter">
          {currentIndex + 1} / {photos.length}
        </div>
        {photo.tagsArray?.length > 0 && (
          <div className="plp-tags">
            {photo.tagsArray.map((tag, i) => (
              <span key={i} className="plp-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
