import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountOfferCard } from "@/components/account-offer-card";
import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { HeroPanel, PageSection, SoftPanel } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";

type OfferStatus = "pending" | "thinking" | "accepted" | "soft_rejected" | "redirected" | "withdrawn" | "expired" | "cancelled_after_accept";
type MaybeArray<T> = T | T[] | null | undefined;
const firstOrNull = <T,>(value: MaybeArray<T>): T | null => !value ? null : Array.isArray(value) ? value[0] ?? null : value;

export default async function SentOffersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
const params = await searchParams; const tabs = ["all", "pending", "thinking", "accepted", "soft_rejected", "redirected"] as const;
const tab = tabs.includes((params.tab as (typeof tabs)[number]) ?? "all") ? (params.tab as (typeof tabs)[number] ?? "all") : "all";
const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login?next=/dashboard/offers/sent");
const { data } = await supabase.from("offers").select("id,status,created_at,parent_offer_id,requested_item:items!offers_requested_item_id_fkey(title),offered_item:items!offers_offered_item_id_fkey(title),receiver:profiles!offers_receiver_id_fkey(display_name)").eq("sender_id", user.id).order("created_at", { ascending: false });
const offers = (data ?? []).map((offer) => ({ id: offer.id, status: offer.status as OfferStatus, created_at: offer.created_at, requestedTitle: firstOrNull(offer.requested_item as MaybeArray<{ title: string }>)?.title ?? "-", offeredTitle: firstOrNull(offer.offered_item as MaybeArray<{ title: string }>)?.title ?? "-", parent_offer_id: offer.parent_offer_id, otherName: firstOrNull(offer.receiver as MaybeArray<{ display_name: string | null }>)?.display_name ?? "مستخدم" })).filter((offer) => (tab === "all" ? true : offer.status === tab));
return <PageShell title="عروض بعتها"><PageSection><HeroPanel><h1 className="text-2xl font-semibold">عروض بعتها</h1><p className="mt-1 text-sm text-app-text-secondary">تابع حالة عروضك واعرف رد الطرف التاني.</p></HeroPanel><SoftPanel className="flex flex-wrap gap-2">{[["all","الكل"],["pending","مستنية رد"],["thinking","محتاج تفكير"],["accepted","اتقبلت"],["soft_rejected","ما ظبطتش"],["redirected","اتفتح باب تاني"]].map(([k,l])=><Link key={k} href={k==="all"?"/dashboard/offers/sent":`/dashboard/offers/sent?tab=${k}`} className="rounded-full border px-3 py-1.5 text-sm">{l}</Link>)}</SoftPanel>{offers.length===0?<SoftPanel><p className="font-semibold">لسه ما بعتش عروض.</p><p className="mt-1 text-sm text-app-text-muted">اختار حاجة مناسبة من السوق وابدأ مقايضة جديدة.</p><ButtonLink href="/items" variant="secondary" size="sm" className="mt-3">شوف السوق</ButtonLink></SoftPanel>:<div className="grid gap-3">{offers.map((offer)=><AccountOfferCard key={offer.id} offer={offer} sideLabel="إلى" ctaLabel="افتح العرض" />)}</div>}</PageSection></PageShell>;
}
