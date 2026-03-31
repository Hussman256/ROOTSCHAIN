import { StateLabels, StateColors } from "../hooks/useSupplyChain";

interface StateBadgeProps {
  state: number;
}

export default function StateBadge({ state }: StateBadgeProps) {
  const label = StateLabels[state] ?? "Unknown";
  const color = StateColors[state] ?? "bg-zinc-700 text-zinc-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${color}`}
    >
      {label}
    </span>
  );
}
