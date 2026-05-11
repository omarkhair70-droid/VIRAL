import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountOfferCard } from "@/components/account-offer-card";
import { PageShell } from "@/components/page-shell";
import { createClient } from "@/lib/supabase/server";

type OfferStatus = "pending" | "thinking" | "accepted" | "soft_rejected" | "redirected" | "withdrawn" | "expired" | "cancelled_after_accept";
type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function SentOffersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const tabs = ["all", "pending", "thinking", "accepted", "soft_rejected", "redirected"] as const;
  const tab = tabs.includes((params.tab as (typeof tabs)[number]) ?? "all") ? (params.tab as (typeof tabs)[number] ?? "all") : "all";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/offers/sent");

  const { data } = await supabase
    .from("offers")
    .select("id,status,created_at,requested_item:items!offers_requested_item_id_fkey(title),offered_item:items!offers_offered_item_id_fkey(title),receiver:profiles!offers_receiver_id_fkey(display_name)")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  const offers = (data ?? []).map((offer) => ({
    id: offer.id,
    status: offer.status as OfferStatus,
    created_at: offer.created_at,
    requestedTitle: firstOrNull(offer.requested_item as MaybeArray<{ title: string }>)?.title ?? "-",
    offeredTitle: firstOrNull(offer.offered_item as MaybeArray<{ title: string }>)?.title ?? "-",
    otherName: firstOrNull(offer.receiver as MaybeArray<{ display_name: string | null }>)?.display_name ?? "مستخدم",
  })).filter((offer) => (tab === "all" ? true : offer.status === tab));

  return <PageShell title="عروض بعتها"><div className="mb-4 flex flex-wrap gap-2">{[["all","الكل"],["pending","مستنية رد"],["thinking","محتاج تفكير"],["accepted","اتقبلت"],["soft_rejected","ما ظبطتش"],["redirected","اتفتح باب تاني"]].map(([key,label])=><Link key={key} href={key==="all"?"/dashboard/offers/sent":`/dashboard/offers/sent?tab=${key}`} className="rounded-lg border px-3 py-1.5 text-sm">{label}</Link>)}</div>{offers.length===0?<p className="rounded-xl border bg-white p-4">لسه ما بعتش عروض.</p>:<div className="grid gap-3">{offers.map((offer)=><AccountOfferCard key={offer.id} offer={offer} sideLabel="إلى" ctaLabel="افتح العرض" />)}</div>}</PageShell>;
}
