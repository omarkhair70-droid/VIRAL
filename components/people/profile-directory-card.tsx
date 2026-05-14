import Image from "next/image";
import type { Route } from "next";
import { ButtonLink } from "@/components/ui/button";
import { MetricPill } from "@/components/ui/product-primitives";
import { SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { TrustBadges } from "@/components/trust-badges";
import type { TrustBadge } from "@/lib/trust-badges";

type ProfileDirectoryCardProps = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  city: string | null;
  area: string | null;
  tagline: string | null;
  bio: string | null;
  successfulSwapsCount: number;
  activeItemsCount: number;
  trustBadges: TrustBadge[];
};

export function ProfileDirectoryCard(props: ProfileDirectoryCardProps) {
  const location = [props.city, props.area].filter(Boolean).join(" - ");
  const summary = props.tagline || props.bio;

  return (
    <SurfaceCard className="h-full p-0">
      <div className="flex h-full flex-col gap-4 p-panel-md">
        <div className="flex items-start gap-3">
          {props.avatarUrl ? (
            <Image src={props.avatarUrl} alt={props.displayName} width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-1 ring-app-border" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-app-soft text-lg font-semibold text-app-text-secondary ring-1 ring-app-border">
              {props.displayName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-base font-semibold text-app-text-primary">{props.displayName}</p>
            <p className="truncate text-sm text-app-text-muted">@{props.username}</p>
            <p className="truncate text-sm text-app-text-muted">{location || "المكان غير مضاف لسه"}</p>
          </div>
        </div>

        <SoftPanel className="p-3">
          <p className="line-clamp-2 text-sm text-app-text-secondary">{summary || "مقدّم نبذة بسيطة عن طريقته في المقايضة قريبًا."}</p>
        </SoftPanel>

        <div className="flex flex-wrap gap-2">
          <MetricPill label="مقايضات مكتملة" value={props.successfulSwapsCount} dense />
          <MetricPill label="حاجات نشطة" value={props.activeItemsCount} dense />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-app-text-muted">إشارات ثقة من تقييمات ومقايضات سابقة</p>
          {props.trustBadges.length ? (
            <TrustBadges badges={props.trustBadges} compact maxVisible={2} />
          ) : (
            <p className="text-xs text-app-text-muted">لسه مفيش إشارات كفاية.</p>
          )}
        </div>

        <ButtonLink href={`/users/${props.username}` as Route} variant="outline" size="sm" className="mt-auto self-start">
          افتح البروفايل
        </ButtonLink>
      </div>
    </SurfaceCard>
  );
}
