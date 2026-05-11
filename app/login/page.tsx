import { sendMagicLink } from "./actions";

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
    <section className="mx-auto max-w-xl space-y-5 px-4 py-12">
      <h1 className="text-3xl font-bold">ادخل علشان نعرف نرجعلك بردود العروض.</h1>
      <p className="text-stone-700">هتسجل بإيميلك، وبعدها تقدر تنشر حاجتك وتتابع العروض اللي توصلك.</p>

      {error ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-700">
          {error === "empty_email" ? "اكتب الإيميل الأول." : "ماعرفناش نبعت اللينك دلوقتي. جرّب تاني."}
        </div>
      ) : null}

      {sent ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800">
          <p>بعتنالك لينك الدخول على الإيميل.</p>
          <p>افتحه وكمل من نفس المتصفح.</p>
        </div>
      ) : null}

      <form action={sendMagicLink} className="space-y-3 rounded-2xl border border-stone-200 p-4">
        <input type="hidden" name="next" value={next} />
        <label htmlFor="email" className="block text-sm font-medium text-stone-800">
          الإيميل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          className="w-full rounded-xl border border-stone-300 px-3 py-2"
        />
        <button type="submit" className="w-full rounded-xl bg-stone-900 px-4 py-2 font-medium text-white">
          ابعتهولي لينك الدخول
        </button>
      </form>
    </section>
  );
}
