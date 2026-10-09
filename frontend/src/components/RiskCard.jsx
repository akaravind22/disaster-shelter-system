export default function RiskCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "",
}) {
  return (
    <article className={"stat-card " + tone}>
      <span className="stat-icon">
        <Icon size={20} />
      </span>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
