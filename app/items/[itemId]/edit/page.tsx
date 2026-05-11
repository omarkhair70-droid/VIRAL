import { notFound, redirect } from "next/navigation";
import { ItemEditForm } from "@/components/item-edit-form";
import { createClient } from "@/lib/supabase/server";
import { updateItem } from "./actions";

export default async function EditItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/items/${itemId}/edit`);

  const [{ data: item }, { data: categories }] = await Promise.all([
    supabase.from("items").select("id,owner_id,title,category_id,description,condition,condition_notes,city,area,desire_mode,desire_text").eq("id", itemId).maybeSingle(),
    supabase.from("categories").select("id,name_ar").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  if (!item || item.owner_id !== user.id) notFound();

  const { data: tags } = await supabase.from("item_wanted_tags").select("tag").eq("item_id", item.id);

  return <section className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-4 text-2xl font-bold">تعديل الإعلان</h1><ItemEditForm action={updateItem} categories={categories ?? []} item={{ ...item, wanted_tags: (tags ?? []).map((tag) => tag.tag).join(", ") }} /></section>;
}
