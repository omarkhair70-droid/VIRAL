import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";

export default function PlaceholderPage() {
  return (
    <PageShell title="Placeholder">
      <EmptyState title="المرحلة 0" hint="الصفحة دي مجهزة كتأسيس تقني، والتجربة الكاملة جاية في المرحلة الجاية." />
    </PageShell>
  );
}
