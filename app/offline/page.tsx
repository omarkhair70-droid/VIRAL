import { OfflineRetryButton } from "@/components/offline-retry-button";
import { AppIcon } from "@/components/ui/app-icon";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-10">
      <Card className="w-full rounded-3xl text-center">
        <CardContent className="space-y-4">
          <div className="mx-auto inline-flex rounded-2xl bg-clay/10 p-3 text-clay">
            <AppIcon name="warning" className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">واضح إن الإنترنت فاصل</CardTitle>
          <p className="text-sm text-muted">ولا يهمك. أول ما الاتصال يرجع هتقدر تكمل التصفح والمقايضة بشكل طبيعي.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <ButtonLink href="/" variant="secondary">افتح الرئيسية</ButtonLink>
            <ButtonLink href="/items">افتح السوق</ButtonLink>
            <OfflineRetryButton />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
