import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareActions } from "@/components/share-actions";
import { ImageFrame } from "@/components/ui/image-frame";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ItemStatus = "active" | "archived" | "reserved" | "swapped" | "removed";

type ItemMetadataRow = {
  id: string;
  title: string;
  description: string | null;
  status: ItemStatus;
  item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null;
};

type ItemDetailRawRow = {
  id: string;
  owner_id: string;
  status: ItemStatus;
  title: string;
  description: string | null;
  condition: "almost_new" | "good_used" | "minor_issues" | "needs_repair";
  condition_notes: string | null;
  city: string | null;
  area: string | null;
  desire_mode: "specific" | "flexible" | "surprise";
  desire_text: string | null;
  created_at: string;
  categories: MaybeArray<{ name_ar: string | null }>;
  item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null;
  item_wanted_tags: Array<{ tag: string }> | null;
  profiles: MaybeArray<{ display_name: string | null; username: string | null; city: string | null; successful_swaps_count: number | null }>;
};

const PUBLIC_METADATA_STATUSES: ItemStatus[] = ["active", "reserved", "swapped"];
const conditionLabels = {
  almost_new: "جديد تقريبًا",
  good_used: "مستخدم بحالة كويسة",
  minor_issues: "فيه عيوب بسيطة",
  needs_repair: "محتاج تصليح / عارف حالته",
};
const desireLabels = {
  specific: "بدور على حاجة معينة",
  flexible: "مرن في نوع الحاجة",
  surprise: "مفتوح لأي حاجة مناسبة",
};

export async function generateMetadata({ params }: { params: Promise<{ itemId: string }> }): Promise<Metadata> {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("id,title,description,status,item_images(image_url,is_primary)")
    .eq("id", itemId)
    .maybeSingle();

  const item = data as ItemMetadataRow | null;
  if (!item || !PUBLIC_METADATA_STATUSES.includes(item.status)) {
    return {
      title: "إعلان على بدّلها",
      description: "شوف الإعلانات العامة على بدّلها.",
    };
  }

  const imageUrl = item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null;
  const description = item.description || "شوف الإعلان ده على بدّلها.";

  return {
    title: `${item.title} | بدّلها`,
    description,
    openGraph: {
      title: `${item.title} | بدّلها`,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: `${item.title} | بدّلها`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ItemDetailPage({ params, searchParams }: { params: Promise<{ itemId: string }>; searchParams?: Promise<{ reported?: string }> }) {
  const { itemId } = await params;
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: item, error } = await supabase
    .from("items")
    .select(
      "id,owner_id,status,title,description,condition,condition_notes,city,area,desire_mode,desire_text,created_at,categories(name_ar),item_images(image_url,is_primary),item_wanted_tags(tag),profiles!items_owner_id_fkey(display_name,username,city,successful_swaps_count)",
    )
    .eq("id", itemId)
    .maybeSingle();

  if (error || !item) notFound();
  if (item.status === "archived" && user?.id !== item.owner_id) notFound();

  const typed = item as unknown as ItemDetailRawRow;
  const img = typed.item_images?.find((x) => x.is_primary)?.image_url ?? typed.item_images?.[0]?.image_url ?? null;
  const owner = firstOrNull(typed.profiles);

  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-[1.1fr_1fr]">
      {query.reported === "1" ? (
        <p className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">تم إرسال البلاغ. شكرًا إنك ساعدتنا نحافظ على التجربة.</p>
      ) : null}
      <div className="space-y-4">
        <ImageFrame imageUrl={img} title={typed.title} />
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusPill>{firstOrNull(typed.categories)?.name_ar ?? "بدون تصنيف"}</StatusPill>
            <StatusPill tone="warning">{conditionLabels[typed.condition]}</StatusPill>
          </div>
          <h1 className="text-3xl font-bold">{typed.title}</h1>
          {typed.description ? <p className="mt-3 text-stone-700">{typed.description}</p> : null}
          {typed.condition_notes ? <p className="mt-2 text-sm text-stone-600">{typed.condition_notes}</p> : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="font-semibold">تفاصيل الإعلان</p>
          <p className="mt-2 text-sm text-stone-600">{[typed.city, typed.area].filter(Boolean).join(" - ") || "الموقع غير مضاف"}</p>
          <p className="mt-2 text-sm text-stone-700">{desireLabels[typed.desire_mode]}</p>
          {typed.desire_text ? <p className="mt-2 text-sm">{typed.desire_text}</p> : null}
          {typed.item_wanted_tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {typed.item_wanted_tags.map((tag) => (
                <span key={tag.tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs">
                  {tag.tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="font-semibold">صاحب الإعلان</p>
          {owner?.username ? (
            <Link href={`/users/${owner.username}`} className="mt-1 inline-block font-medium hover:underline">
              {owner.display_name ?? "مستخدم"}
            </Link>
          ) : (
            <p className="mt-1">{owner?.display_name ?? "مستخدم"}</p>
          )}
          <p className="text-sm text-stone-600">{owner?.city ?? ""}</p>
          <p className="text-sm text-stone-600">مقايضات ناجحة: {owner?.successful_swaps_count ?? 0}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <ShareActions
            label={user?.id === typed.owner_id ? "شارك إعلانك" : "شارك الإعلان"}
            title={typed.title}
            text="شوف الإعلان ده على بدّلها — بدّل الحاجة بدل ما تسيبها مركونة."
            urlPath={`/items/${typed.id}`}
          />
        </div>

        {user?.id === typed.owner_id ? (
          <div className="rounded-xl bg-amber-50 p-3 text-amber-800">دي حاجتك أنت.</div>
        ) : (
          <Link href={`/offers/new?requestedItemId=${typed.id}`} className="inline-block rounded-xl bg-clay px-5 py-3 text-white">
            اعرض حاجة عندك
          </Link>
        )}

        {user?.id === typed.owner_id ? (
          <div className="flex gap-2">
            <Link href={`/items/${typed.id}/edit`} className="inline-block rounded-xl border px-4 py-2">
              عدّل الإعلان
            </Link>
            <Link href="/dashboard/items" className="inline-block rounded-xl border px-4 py-2">
              إدارة حاجاتي
            </Link>
          </div>
        ) : null}
        {user && user.id !== typed.owner_id ? (
          <Link href={`/report?itemId=${typed.id}&returnTo=${encodeURIComponent(`/items/${typed.id}`)}`} className="inline-block text-sm text-stone-600 hover:underline">
            بلّغ عن الإعلان
          </Link>
        ) : null}
        <p className="text-xs text-stone-500">اتنشر يوم {new Date(typed.created_at).toLocaleDateString("ar-EG")}</p>
      </div>
    </section>
  );
}
