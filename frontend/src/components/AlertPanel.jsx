import { TriangleAlert, CheckCircle2 } from "lucide-react";
export default function AlertPanel({ alerts }) {
  return (
    <div className="alerts">
      {alerts.map((a, i) => (
        <div className={"alert " + a.level} key={a.code + i}>
          {a.level === "success" ? (
            <CheckCircle2 size={19} />
          ) : (
            <TriangleAlert size={19} />
          )}
          <div>
            <strong>{a.code.replaceAll("_", " ")}</strong>
            <p>{a.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
