"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FeedCard } from "@/components/feed-card";
import { SectionHeading } from "@/components/section-heading";
import { demoFeedItems, type FeedStatus } from "@/lib/demo-feed";

const tabs: { label: string; value: "all" | FeedStatus }[] = [
  { label: "الكل", value: "all" },
  { label: "عروض شغالة", value: "active" },
  { label: "تحت التفكير", value: "thinking" },
  { label: "اتفتح باب تاني", value: "redirected" },
  { label: "صفقات تمت", value: "completed" },
  { label: "حاجات جديدة", value: "new" }
];

export default function FeedPage() {
  const [filter, setFilter] = useState<(typeof tabs)[number]["value"]>("all");
  const list = useMemo(() => filter === "all" ? demoFeedItems : demoFeedItems.filter((i) => i.status === filter), [filter]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="الصفقات الغريبة" subtitle="هنا العروض نفسها جزء من الفرجة. مش كل صفقة لازم تبقى منطقية للناس… المهم تنفع أصحابها." />
      <div className="mb-6 flex flex-wrap gap-2">{tabs.map((tab) => <button key={tab.value} onClick={() => setFilter(tab.value)} className={`rounded-full border px-4 py-2 text-sm ${filter === tab.value ? "border-clay bg-clay text-white" : "border-stone-300 bg-white"}`}>{tab.label}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-2">{list.map((item) => <FeedCard key={item.id} item={item} />)}</div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/discover" className="rounded-xl bg-clay px-5 py-3 text-white">شوف حاجتك ممكن تجيبلك إيه</Link>
        <Link href="/items/new" className="rounded-xl border border-stone-300 px-5 py-3">اعرض حاجة</Link>
      </div>
    </section>
  );
}
