import './Skeleton.css'

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image shimmer"></div>
      <div className="skeleton-content">
        <div className="skeleton-title shimmer"></div>
        <div className="skeleton-text shimmer"></div>
        <div className="skeleton-tags">
          <div className="skeleton-tag shimmer"></div>
          <div className="skeleton-tag shimmer"></div>
        </div>
      </div>
    </div>
  )
}