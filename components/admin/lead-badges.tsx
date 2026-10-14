import { Badge, type BadgeTone } from "@/components/ui/card";
import { LEAD_TYPE_LABELS, type LeadStatus, type LeadType } from "@/lib/constants";

const STATUS_TONES: Record<LeadStatus, BadgeTone> = {
  new: "accent",
  contacted: "primary",
  qualified: "primary",
  proposal: "warning",
  won: "success",
  lost: "danger",
  closed: "neutral",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge tone={STATUS_TONES[status]} className="capitalize">
      {status}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: LeadType }) {
  return <Badge>{LEAD_TYPE_LABELS[type]}</Badge>;
}
