import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";

function cx(base: string, className?: string) { return `${base} ${className ?? ""}`; }

type UploadBaseProps = {
  name: string;
  accept?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  uploading?: boolean;
  previewUrl?: string | null;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "accept" | "onChange">;
  onRemove?: () => void;
};

function UploadText({ helperText, errorText }: { helperText?: string; errorText?: string }) {
  return <>{helperText ? <p className="type-meta">{helperText}</p> : null}{errorText ? <p className="text-xs font-medium text-red-700">{errorText}</p> : null}</>;
}

export function AvatarUpload(props: UploadBaseProps) {
  const { name, accept = "image/jpeg,image/png,image/webp", previewUrl, helperText, errorText, disabled, uploading, onChange, onRemove, inputProps } = props;
  return <div className="space-y-2"><div className="flex items-center gap-3">{previewUrl ? <img src={previewUrl} alt="avatar preview" className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full border border-app-border bg-app-soft text-app-text-muted"><AppIcon name="profile" /></div>}<div className="space-y-2"><label className="inline-flex cursor-pointer"><span className="sr-only">رفع أفاتار</span><input type="file" name={name} accept={accept} onChange={onChange} disabled={disabled || uploading} className="hidden" {...inputProps} /><span className="inline-flex min-h-10 items-center rounded-button border border-app-border bg-app-surface px-3 py-2 text-sm">{previewUrl ? "تغيير الصورة" : "إضافة صورة"}</span></label>{previewUrl && onRemove ? <Button type="button" size="compact" variant="quiet" onClick={onRemove} disabled={disabled || uploading}>إزالة</Button> : null}{uploading ? <p className="type-meta">جاري الرفع...</p> : null}</div></div><UploadText helperText={helperText} errorText={errorText} /></div>;
}

export function CoverUpload(props: UploadBaseProps) {
  const { name, accept = "image/jpeg,image/png,image/webp", previewUrl, helperText, errorText, disabled, uploading, onChange, onRemove, inputProps } = props;
  return <div className="space-y-2"><div className="relative aspect-[16/5] overflow-hidden rounded-surface border border-app-border bg-app-soft">{previewUrl ? <img src={previewUrl} alt="cover preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-app-text-muted">بدون غلاف</div>}</div><div className="flex items-center gap-2"><label className="inline-flex cursor-pointer"><input type="file" name={name} accept={accept} onChange={onChange} disabled={disabled || uploading} className="hidden" {...inputProps} /><span className="inline-flex min-h-10 items-center rounded-button border border-app-border bg-app-surface px-3 py-2 text-sm">{previewUrl ? "تغيير الغلاف" : "إضافة غلاف"}</span></label>{previewUrl && onRemove ? <Button type="button" size="compact" variant="quiet" onClick={onRemove} disabled={disabled || uploading}>إزالة</Button> : null}{uploading ? <span className="type-meta">جاري الرفع...</span> : null}</div><UploadText helperText={helperText} errorText={errorText} /></div>;
}

export function MediaUploadBlock({ title, helperText, errorText, children, className }: { title: string; helperText?: string; errorText?: string; children: ReactNode; className?: string }) {
  return <div className={cx("space-y-3 rounded-surface border border-app-border bg-app-surface p-panel-md", className)}><h3 className="type-card-title">{title}</h3>{children}<UploadText helperText={helperText} errorText={errorText} /></div>;
}

export function Badge({ tone = "neutral", children, dense = false }: { tone?: "neutral" | "accent" | "positive" | "warning" | "danger" | "info" | "meta"; children: ReactNode; dense?: boolean }) { const toneClass = { neutral: "bg-app-soft text-app-text-secondary", accent: "bg-app-accent-soft text-app-text-secondary", positive: "bg-emerald-100 text-emerald-900", warning: "bg-amber-100 text-amber-900", danger: "bg-red-100 text-red-900", info: "bg-sky-100 text-sky-900", meta: "bg-stone-100 text-stone-700" }[tone]; return <span className={cx(`inline-flex items-center rounded-full ${dense ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"} font-medium`, toneClass)}>{children}</span>; }
export const StatusPill = Badge;
export function TrustChip(props: { children: ReactNode; tone?: "positive" | "info" | "meta"; dense?: boolean }) { return <Badge tone={props.tone ?? "positive"} dense={props.dense}>{props.children}</Badge>; }
export function MetricPill({ label, value, dense = false }: { label: string; value: string | number; dense?: boolean }) { return <span className={cx("inline-flex items-center gap-1 rounded-full border border-app-border bg-app-surface", dense ? "px-2 py-0.5" : "px-3 py-1")}><span className="type-numeric">{value}</span><span className="type-meta">{label}</span></span>; }
export function CountBadge({ count }: { count: number }) { return <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-app-accent px-1.5 py-0.5 text-[11px] font-semibold text-white">{count > 99 ? "99+" : count}</span>; }

export function StateBlock({ title, body, tone = "neutral", primaryAction, secondaryAction }: { title: string; body?: string; tone?: "neutral" | "danger" | "success" | "info"; primaryAction?: ReactNode; secondaryAction?: ReactNode }) { const toneClass = tone === "danger" ? "border-red-200 bg-red-50" : tone === "success" ? "border-emerald-200 bg-emerald-50" : tone === "info" ? "border-sky-200 bg-sky-50" : "border-app-border bg-app-soft"; return <div className={cx("rounded-surface border p-panel-md", toneClass)}><h3 className="type-card-title">{title}</h3>{body ? <p className="mt-2 type-support">{body}</p> : null}{(primaryAction || secondaryAction) ? <div className="mt-4 flex gap-2">{primaryAction}{secondaryAction}</div> : null}</div>; }
export const EmptyState = StateBlock; export const LoadingState = StateBlock; export const ErrorState = StateBlock; export const SuccessState = StateBlock; export const InfoState = StateBlock; export const ProcessingState = StateBlock;

export function MediaFrame({ src, alt, ratio = "square", fallback }: { src?: string | null; alt: string; ratio?: "square" | "portrait" | "wide" | "hero"; fallback?: ReactNode }) { const ratioClass = ratio === "portrait" ? "aspect-[3/4]" : ratio === "wide" ? "aspect-[16/10]" : ratio === "hero" ? "aspect-[16/7]" : "aspect-square"; return <div className={cx("overflow-hidden rounded-surface-compact bg-app-soft", ratioClass)}>{src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : fallback ?? <div className="flex h-full items-center justify-center text-sm text-app-text-muted">لا توجد صورة</div>}</div>; }
export function GalleryIndicator({ current, total }: { current: number; total: number }) { return <div className="inline-flex items-center gap-1">{Array.from({ length: total }).map((_, i) => <span key={i} className={cx("h-1.5 w-1.5 rounded-full", i + 1 === current ? "bg-app-accent" : "bg-app-border")} />)}</div>; }
export function MediaSkeleton({ ratio = "square" }: { ratio?: "square" | "portrait" | "wide" | "hero" }) { return <MediaFrame alt="" ratio={ratio} fallback={<div className="h-full w-full animate-pulse bg-app-soft motion-reduce:animate-none" />} />; }
