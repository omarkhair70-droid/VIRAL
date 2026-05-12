export type TrustTraitKey = "clear_description" | "good_communication" | "on_time" | "respectful_swapper";

export type TrustCounts = Record<TrustTraitKey, number>;

export type TrustBadge = {
  key: TrustTraitKey | "completed_swapper" | "beta_member";
  label: string;
  icon: "check" | "chat" | "clock" | "shield" | "swap" | "spark";
  count?: number;
  tone: "trait" | "derived";
};

export const TRUST_TRAIT_LABELS: Record<TrustTraitKey, string> = {
  clear_description: "وصف واضح",
  good_communication: "تواصل كويس",
  on_time: "ملتزم بالاتفاق",
  respectful_swapper: "محترم في التعامل",
};

export function buildTrustBadges({ counts, successfulSwapsCount, includeBeta = true }: { counts: TrustCounts; successfulSwapsCount: number; includeBeta?: boolean; }): TrustBadge[] {
  const traitBadges = [
    { key: "clear_description", label: TRUST_TRAIT_LABELS.clear_description, icon: "check", count: counts.clear_description, tone: "trait" },
    { key: "good_communication", label: TRUST_TRAIT_LABELS.good_communication, icon: "chat", count: counts.good_communication, tone: "trait" },
    { key: "on_time", label: TRUST_TRAIT_LABELS.on_time, icon: "clock", count: counts.on_time, tone: "trait" },
    { key: "respectful_swapper", label: TRUST_TRAIT_LABELS.respectful_swapper, icon: "shield", count: counts.respectful_swapper, tone: "trait" },
  ] satisfies TrustBadge[];

  const activeTraitBadges = traitBadges.filter((badge) => (badge.count ?? 0) > 0);

  const derived: TrustBadge[] = [];
  if (successfulSwapsCount > 0) {
    derived.push({ key: "completed_swapper", label: "مقايض مكتمل", icon: "swap", tone: "derived" });
  }
  if (includeBeta) {
    derived.push({ key: "beta_member", label: "عضو Beta", icon: "spark", tone: "derived" });
  }

  return [...activeTraitBadges, ...derived];
}

export function selectedTrustTraitsFromReview(review: Partial<Record<TrustTraitKey, boolean>>): string[] {
  return (Object.keys(TRUST_TRAIT_LABELS) as TrustTraitKey[]).filter((key) => review[key]).map((key) => TRUST_TRAIT_LABELS[key]);
}
