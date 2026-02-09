import type { RiskAnnotation, RiskLevel } from "@/types/mirror";

export interface RiskSummary {
  level: RiskLevel;
  redCount: number;
  yellowCount: number;
  greenCount: number;
  total: number;
  label: string;
}

export function calculateRisk(annotations: RiskAnnotation[]): RiskSummary {
  const redCount = annotations.filter((a) => a.risk === "red").length;
  const yellowCount = annotations.filter((a) => a.risk === "yellow").length;
  const greenCount = annotations.filter((a) => a.risk === "green").length;
  const total = annotations.length;

  let level: RiskLevel;
  let label: string;

  if (redCount > 0) {
    level = "red";
    label = `${redCount} 处高风险`;
  } else if (yellowCount > 0) {
    level = "yellow";
    label = `${yellowCount} 处需注意`;
  } else {
    level = "green";
    label = "表达安全";
  }

  return { level, redCount, yellowCount, greenCount, total, label };
}
