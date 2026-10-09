type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "negative";
};

export default function StatCard({ label, value, detail, tone = "default" }: StatCardProps) {
  return (
    <div className="card stat-card">
      <p className="stat-label">{label}</p>
      <p className={tone === "negative" ? "stat-value negative" : "stat-value"}>{value}</p>
      <p className="stat-detail">{detail}</p>
    </div>
  );
}
