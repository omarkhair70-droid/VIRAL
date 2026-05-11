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

export default async function ReceivedOffersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const tabs = ["all", "pending", "thinking", "accepted", "soft_rejected", "redirected"] as const;
  const tab = tabs.includes((params.tab as (typeof tabs)[number]) ?? "all") ? (params.tab as (typeof tabs)[number] ?? "all") : "all";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/offers/received");

  const { data } = await supabase
    .from("offers")
    .select("id,status,created_at,parent_offer_id,requested_item:items!offers_requested_item_id_fkey(title),offered_item:items!offers_offered_item_id_fkey(title),sender:profiles!offers_sender_id_fkey(display_name)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  const offers = (data ?? []).map((offer) => ({
    id: offer.id,
    status: offer.status as OfferStatus,
    created_at: offer.created_at,
    requestedTitle: firstOrNull(offer.requested_item as MaybeArray<{ title: string }>)?.title ?? "-",
    offeredTitle: firstOrNull(offer.offered_item as MaybeArray<{ title: string }>)?.title ?? "-",
    parent_offer_id: offer.parent_offer_id,
    otherName: firstOrNull(offer.sender as MaybeArray<{ display_name: string | null }>)?.display_name ?? "مستخدم",
  })).filter((offer) => (tab === "all" ? true : offer.status === tab));

  return <PageShell title="عروض وصلتني"><div className="mb-4 flex flex-wrap gap-2">{[["all","الكل"],["pending","مستنية رد"],["thinking","محتاج تفكير"],["accepted","اتقبلت"],["soft_rejected","ما ظبطتش"],["redirected","اتفتح باب تاني"]].map(([key,label])=><Link key={key} href={key==="all"?"/dashboard/offers/received":`/dashboard/offers/received?tab=${key}`} className="rounded-lg border px-3 py-1.5 text-sm">{label}</Link>)}</div>{offers.length===0?<div className="rounded-xl border bg-white p-5"><p className="font-semibold">لسه ما وصلكش عروض.</p><p className="mt-1 text-sm text-stone-600">بعد ما تعرض حاجة، العروض هتظهر هنا عشان ترد عليها.</p><Link href="/items/new" className="mt-3 inline-flex rounded-lg border px-3 py-2 text-sm">اعرض حاجة</Link></div>:<div className="grid gap-3">{offers.map((offer)=><AccountOfferCard key={offer.id} offer={offer} sideLabel="من" ctaLabel={offer.status === "pending" || offer.status === "thinking" ? "افتح ورد" : "افتح العرض"} />)}</div>}</PageShell>;
}
