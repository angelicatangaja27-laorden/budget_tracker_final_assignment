export default function LoadingState() {
  return (
    <div className="loading-state" role="status">
      <span className="visually-hidden">Loading your budget…</span>
      <div className="skeleton skeleton-bar" />
      <div className="skeleton-row">
        <div className="skeleton skeleton-tile" />
        <div className="skeleton skeleton-tile" />
        <div className="skeleton skeleton-tile" />
        <div className="skeleton skeleton-tile" />
      </div>
      <div className="skeleton skeleton-panel" />
    </div>
  );
}
