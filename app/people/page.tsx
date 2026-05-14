import type { Metadata } from "next";
import { PeopleDirectorySearch } from "@/components/people/people-directory-search";
import { ProfileDirectoryCard } from "@/components/people/profile-directory-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/product-primitives";
import { HeroPanel, PageSection, PageShell, SoftPanel } from "@/components/ui/surfaces";
import { buildTrustBadges, type TrustCounts } from "@/lib/trust-badges";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ناس تِسوى",
  description: "دليل ناس تِسوى: بروفايلات عامة، إشارات ثقة، وحاجات نشطة للمقايضة.",
};

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  profile_tagline: string | null;
  bio: string | null;
  city: string | null;
  area: string | null;
  successful_swaps_count: number;
};

function sanitizePeopleSearchQuery(raw: string) {
  return raw.trim().slice(0, 80).replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}

export default async function PeoplePage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = (await searchParams) ?? {};
  const q = params.q?.trim() ?? "";
  const safeQuery = sanitizePeopleSearchQuery(q);
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id,username,display_name,avatar_url,profile_tagline,bio,city,area,successful_swaps_count")
    .not("username", "is", null)
    .order("successful_swaps_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);

  if (safeQuery) {
    query = query.or(`display_name.ilike.%${safeQuery}%,username.ilike.%${safeQuery}%,city.ilike.%${safeQuery}%,area.ilike.%${safeQuery}%`);
  }

  const { data } = await query;
  const profiles = ((data as ProfileRow[] | null) ?? []).filter((p) => Boolean(p.username));
  const profileIds = profiles.map((p) => p.id);

  const [{ data: items }, { data: reviews }] = await Promise.all([
    profileIds.length ? supabase.from("items").select("owner_id,id").eq("status", "active").in("owner_id", profileIds) : Promise.resolve({ data: [] }),
    profileIds.length
      ? supabase.from("reviews").select("reviewee_id,clear_description,good_communication,on_time,respectful_swapper").in("reviewee_id", profileIds)
      : Promise.resolve({ data: [] }),
  ]);

  const itemsCount = new Map<string, number>();
  (items ?? []).forEach((item) => itemsCount.set(item.owner_id, (itemsCount.get(item.owner_id) ?? 0) + 1));

  const trustCounts = new Map<string, TrustCounts>();
  (reviews ?? []).forEach((row) => {
    const current = trustCounts.get(row.reviewee_id) ?? { clear_description: 0, good_communication: 0, on_time: 0, respectful_swapper: 0 };
    trustCounts.set(row.reviewee_id, {
      clear_description: current.clear_description + (row.clear_description ? 1 : 0),
      good_communication: current.good_communication + (row.good_communication ? 1 : 0),
      on_time: current.on_time + (row.on_time ? 1 : 0),
      respectful_swapper: current.respectful_swapper + (row.respectful_swapper ? 1 : 0),
    });
  });

  return (
    <PageShell className="max-w-6xl space-y-6">
      <PageSection>
        <HeroPanel className="space-y-3">
          <p className="type-meta text-app-text-muted">مجتمع تِسوى</p>
          <h1 className="text-2xl font-semibold text-app-text-primary md:text-3xl">ناس بتبدّل بجد.</h1>
          <p className="max-w-3xl text-sm text-app-text-secondary md:text-base">
            استكشف بروفايلات حقيقية، وافهم أسلوب كل شخص في المقايضة، والثقة اللي بناها من التعاملات، والحاجات اللي لسه متاحة عنده.
          </p>
          <ButtonLink href="/items" variant="secondary" size="sm">تصفّح السوق</ButtonLink>
        </HeroPanel>

        <PeopleDirectorySearch query={q} />

        {safeQuery ? (
          <SoftPanel className="py-3">
            <p className="text-sm text-app-text-secondary">نتائج البحث عن: <span className="font-medium text-app-text-primary">{safeQuery}</span></p>
          </SoftPanel>
        ) : null}

        {!profiles.length ? (
          <EmptyState
            title={safeQuery ? "ملقيناش حد بنفس البحث ده." : "ناس تِسوى هيظهروا هنا."}
            body={safeQuery ? "جرّب اسم تاني أو مدينة مختلفة، وهتلاقي بروفايلات أقرب للي بتدور عليه." : "كمّل بروفايلك أو تصفّح السوق، والناس اللي بتبدّل هتظهر هنا بشكل تلقائي."}
            tone="info"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileDirectoryCard
                key={profile.id}
                displayName={profile.display_name?.trim() || profile.username || "مستخدم"}
                username={profile.username as string}
                avatarUrl={profile.avatar_url}
                city={profile.city}
                area={profile.area}
                tagline={profile.profile_tagline}
                bio={profile.bio}
                successfulSwapsCount={profile.successful_swaps_count ?? 0}
                activeItemsCount={itemsCount.get(profile.id) ?? 0}
                trustBadges={buildTrustBadges({
                  counts: trustCounts.get(profile.id) ?? { clear_description: 0, good_communication: 0, on_time: 0, respectful_swapper: 0 },
                  successfulSwapsCount: profile.successful_swaps_count ?? 0,
                  includeBeta: true,
                })}
              />
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
