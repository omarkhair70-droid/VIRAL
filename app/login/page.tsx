import { Button } from "@/components/ui/button";
import { Field, FormActions, Label, TextInput } from "@/components/ui/form";
import { StateBlock } from "@/components/ui/product-primitives";
import { HeroPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { sendMagicLink, signInWithGoogle } from "./actions";

function normalizeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = normalizeNextPath(params.next);
  const sent = params.sent === "1";
  const error = params.error;

  return (
    <PageShell className="max-w-4xl py-10 sm:py-14">
      <PageSection className="grid items-start gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <HeroPanel className="space-y-4">
          <p className="type-meta">تسجيل الدخول</p>
          <h1 className="type-display">ادخل تِسوى وابدأ أول مقايضة.</h1>
          <p className="type-lead text-app-text-secondary">الدخول بجوجل هو الأسرع. وبعده هنجهز بروفايلك ونوصلك لأول خطوة من غير تعقيد.</p>
          <InlineNotice tone="accent">إيميلك مش بيظهر للناس.</InlineNotice>
        </HeroPanel>

        <SurfaceCard className="space-y-4">
          {error ? (
            <StateBlock
              tone="danger"
              title="في مشكلة في الدخول"
              body={error === "empty_email"
                ? "اكتب الإيميل الأول."
                : error === "google_failed"
                  ? "معرفناش نفتح دخول جوجل دلوقتي. راجع إعدادات Google Provider في Supabase."
                  : "ماعرفناش نبعت اللينك دلوقتي. جرّب تاني."}
            />
          ) : null}

          {sent ? (
            <StateBlock
              tone="success"
              title="لينك الدخول اتبعت"
              body="افتح الإيميل وكمل من نفس المتصفح علشان تسجيل الدخول يتم بسهولة."
            />
          ) : null}

          <form action={signInWithGoogle} className="space-y-3">
            <input type="hidden" name="next" value={next} />
            <Button type="submit" size="lg" fullWidth>
              الدخول بجوجل
            </Button>
          </form>

          <SoftPanel className="space-y-3">
            <p className="type-meta text-center">أو كمل بالإيميل</p>
            <form action={sendMagicLink} className="space-y-3">
              <input type="hidden" name="next" value={next} />
              <Field>
                <Label htmlFor="email" required>
                  الإيميل
                </Label>
                <TextInput id="email" name="email" type="email" required placeholder="name@example.com" />
              </Field>
              <FormActions>
                <Button type="submit" variant="secondary" fullWidth>
                  ابعتهولي لينك الدخول
                </Button>
              </FormActions>
            </form>
          </SoftPanel>
        </SurfaceCard>
      </PageSection>
    </PageShell>
  );
}
