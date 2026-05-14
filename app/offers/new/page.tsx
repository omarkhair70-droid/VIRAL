import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { MediaFrame, StateBlock } from "@/components/ui/product-primitives";
import { HeroPanel, HighlightPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";
import { createOffer } from "./actions";
import { OfferComposerClient } from "./offer-composer-client";

type MaybeArray<T> = T | T[] | null | undefined;
const firstOrNull = <T,>(value: MaybeArray<T>): T | null => (!value ? null : Array.isArray(value) ? value[0] ?? null : value);
type Row = { id: string; owner_id: string; title: string; condition: "almost_new"|"good_used"|"minor_issues"|"needs_repair"; status: string; desire_text: string|null; categories: MaybeArray<{name_ar:string|null}>; item_images: Array<{image_url:string|null;is_primary:boolean|null}>|null; profiles: MaybeArray<{display_name:string|null}>; };
type SourceOffer = { id: string; status: string; sender_id: string; requested_item_id: string; offered_item_id: string; public_note: string | null; redirect_type: string | null };

const conditionLabels = { almost_new: "جديد تقريبًا", good_used: "مستخدم بحالة كويسة", minor_issues: "فيه عيوب بسيطة", needs_repair: "محتاج تصليح / عارف حالته" };
const redirectMap: Record<string, string> = { offer_another_item: "اعرض حاجة تانية", ask_for_different_item: "بدور على نوع مختلف", update_preferences: "وضّح اختياراتك أكتر" };
const errorMap: Record<string, string> = { invalid_parent: "مش قادرين نفتح العرض الأصلي. جرّب من صفحة العرض نفسه.", not_followup_allowed: "العرض ده مش متاح تبعت منه عرض تاني.", same_offered_item: "لازم تختار حاجة مختلفة عن العرض الأصلي.", duplicate_followup: "العرض التاني بنفس الحاجة متبعت بالفعل ولسه نشط.", unavailable: "الحاجة المطلوبة مش متاحة للعروض دلوقتي.", image_required: "اختار صورة للحاجة الجديدة.", image_type: "الصورة لازم تكون JPG أو PNG أو WEBP.", image_too_large: "الصورة لازم تكون أقل من 5 ميجا.", image_upload_failed: "مش قادرين نرفع الصورة دلوقتي. جرّب تاني." };

export default async function NewOfferPage({ searchParams }: { searchParams: Promise<{ requestedItemId?: string; fromOffer?: string; error?: string }> }) {
  const params = await searchParams;
  const fromOffer = params.fromOffer?.trim();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const nextQuery = fromOffer ? `fromOffer=${encodeURIComponent(fromOffer)}` : `requestedItemId=${encodeURIComponent(params.requestedItemId?.trim() ?? "")}`;
    redirect(`/login?next=/offers/new?${nextQuery}`);
  }

  let sourceOffer: SourceOffer | null = null;
  let requestedItemId = params.requestedItemId?.trim() ?? "";
  if (fromOffer) {
    const { data } = await supabase.from("offers").select("id,status,sender_id,requested_item_id,offered_item_id,public_note,redirect_type").eq("id", fromOffer).maybeSingle();
    sourceOffer = (data as SourceOffer | null) ?? null;
    if (!sourceOffer || sourceOffer.sender_id !== user.id || sourceOffer.status !== "redirected") {
      return <PageShell><StateBlock title={errorMap[params.error ?? ""] ?? "مش متاح تبعت عرض تاني من هنا."} tone="danger" primaryAction={<ButtonLink href="/items" variant="outline" size="sm">ارجع للسوق</ButtonLink>} secondaryAction={fromOffer ? <a href={`/offers/${fromOffer}`} className="inline-flex min-h-10 items-center rounded-button border border-app-border bg-app-surface px-3 py-2 text-sm">افتح العرض</a> : undefined} /></PageShell>;
    }
    requestedItemId = sourceOffer.requested_item_id;
  }

  if (!requestedItemId) return <PageShell><StateBlock title="مش لاقيين الحاجة اللي عايز تعرض عليها." tone="danger" primaryAction={<ButtonLink href="/items" variant="outline" size="sm">ارجع للسوق</ButtonLink>} /></PageShell>;

  const { data: requested } = await supabase.from("items").select("id,owner_id,title,condition,status,desire_text,categories(name_ar),item_images(image_url,is_primary),profiles!items_owner_id_fkey(display_name)").eq("id", requestedItemId).maybeSingle();
  const { data: ownItems } = await supabase.from("items").select("id,title,condition,categories(name_ar),item_images(image_url,is_primary)").eq("owner_id", user.id).eq("status", "active").order("created_at", { ascending: false });
  const { data: categories } = await supabase.from("categories").select("id,name_ar").eq("is_active", true).order("sort_order", { ascending: true });

  const req = requested as unknown as Row | null;
  if (!req || req.status !== "active") return <PageShell><StateBlock title="الحاجة دي مش متاحة للعروض دلوقتي." tone="danger" primaryAction={<ButtonLink href="/items" variant="outline" size="sm">ارجع للسوق</ButtonLink>} /></PageShell>;
  if (req.owner_id === user.id || params.error === "own_item") return <PageShell><StateBlock title="دي حاجتك أنت. مينفعش تعرض على حاجة بتاعتك." tone="info" primaryAction={<ButtonLink href="/items" variant="outline" size="sm">ارجع للسوق</ButtonLink>} /></PageShell>;

  const reqImg = req.item_images?.find((img) => img.is_primary)?.image_url ?? req.item_images?.[0]?.image_url ?? null;
  const reqOwner = firstOrNull(req.profiles);
  const reqCat = firstOrNull(req.categories);
  const filteredOwnItems = (ownItems ?? []).filter((it) => it.id !== requestedItemId && it.id !== sourceOffer?.offered_item_id);

  return <PageShell className="max-w-6xl">
    <PageSection>
      <HeroPanel>
        <h1 className="text-2xl font-bold">ابعت عرض مقايضة</h1>
        <p className="mt-2 text-app-text-secondary">اختار الحاجة اللي هتعرضها، وراجع الصفقة قبل الإرسال.</p>
      </HeroPanel>
      {params.error && errorMap[params.error] ? <InlineNotice tone="danger">{errorMap[params.error]}</InlineNotice> : null}
      {sourceOffer ? <HighlightPanel className="space-y-2"><p className="font-semibold">فرصة تانية: صاحب الحاجة فتح باب جديد.</p><p className="text-sm text-app-text-secondary">لازم تعرض حاجة مختلفة عن عرضك الأول.</p>{sourceOffer.public_note ? <SoftPanel><p className="text-sm">ملاحظة صاحب الحاجة: {sourceOffer.public_note}</p></SoftPanel> : null}{sourceOffer.redirect_type ? <p className="text-xs text-app-text-muted">نوع الباب التاني: {redirectMap[sourceOffer.redirect_type] ?? sourceOffer.redirect_type}</p> : null}</HighlightPanel> : null}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1.9fr]">
        <SurfaceCard className="h-fit space-y-3">
          <p className="text-sm font-semibold text-clay">الحاجة اللي عايز تاخدها</p>
          <MediaFrame src={reqImg} alt={req.title} ratio="wide" />
          <h2 className="text-xl font-bold">{req.title}</h2>
          <p className="text-sm text-app-text-muted">{reqCat?.name_ar ?? "بدون تصنيف"} · {conditionLabels[req.condition]}</p>
          <p className="text-sm">صاحبها: {reqOwner?.display_name ?? "مستخدم"}</p>
          <SoftPanel><p className="text-sm">هو بيدور على: {req.desire_text ?? "مافيش تفضيل مكتوب. حاول توضّح في رسالتك ليه عرضك مناسب."}</p></SoftPanel>
        </SurfaceCard>

        <form action={createOffer} encType="multipart/form-data">
          <input type="hidden" name="requested_item_id" value={requestedItemId} />
          {sourceOffer ? <input type="hidden" name="parent_offer_id" value={sourceOffer.id} /> : null}
          <OfferComposerClient requestedItem={{ id: req.id, title: req.title, conditionLabel: conditionLabels[req.condition], category: reqCat?.name_ar ?? null, ownerName: reqOwner?.display_name ?? "مستخدم", imageUrl: reqImg, desireText: req.desire_text }} ownItems={filteredOwnItems.map((it) => ({ id: it.id, title: it.title, conditionLabel: conditionLabels[it.condition as keyof typeof conditionLabels], category: firstOrNull(it.categories)?.name_ar ?? null, imageUrl: it.item_images?.find((img) => img.is_primary)?.image_url ?? it.item_images?.[0]?.image_url ?? null }))} categories={(categories ?? []).map((c) => ({ id: c.id, name_ar: c.name_ar }))} hasSourceOffer={Boolean(sourceOffer)} />
        </form>
      </div>
    </PageSection>
  </PageShell>;
}
