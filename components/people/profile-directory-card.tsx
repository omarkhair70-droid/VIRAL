import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
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
    <Card className="h-full rounded-3xl border-warmBorder">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-ink">{props.displayName}</p>
            <p className="text-sm text-muted">@{props.username}</p>
          </div>
          {props.avatarUrl ? (
            <Image
              src={props.avatarUrl}
              alt={props.displayName}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-sm font-semibold text-ink">
              {props.displayName.charAt(0)}
            </div>
          )}
        </div>

        {location ? <p className="text-sm text-muted">{location}</p> : <p className="text-sm text-muted">لسه مكمّلش بيانات المكان.</p>}
        {summary ? <p className="line-clamp-2 text-sm text-ink">{summary}</p> : <p className="text-sm text-muted">بيجهّز بروفايله علشان المقايضات تكون أوضح.</p>}

        <div className="flex flex-wrap gap-2">
          <StatusPill tone="pending">مقايضات مكتملة: {props.successfulSwapsCount}</StatusPill>
          <StatusPill tone="success">حاجات نشطة: {props.activeItemsCount}</StatusPill>
        </div>

        {props.trustBadges.length ? <TrustBadges badges={props.trustBadges.slice(0, 3)} /> : <p className="text-xs text-muted">لسه مفيش إشارات ثقة كفاية.</p>}

        <div className="pt-1">
          <Link href={`/users/${props.username}`} className="inline-flex h-9 items-center rounded-xl border border-warmBorder bg-sand px-3 text-sm font-medium text-ink">
            افتح البروفايل
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
