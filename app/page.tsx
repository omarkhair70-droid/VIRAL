import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "بدّلها | سوق المقايضة",
  description:
    "بدّل الحاجة بدل ما تسيبها مركونة. اعرض حاجة، استقبل عروض، اتفقوا بهدوء، وبعد المقايضة قيّموا بعض.",
};

const steps = ["اعرض الحاجة", "استقبل عروض", "اتفقوا بأمان", "قيّموا بعض بعد المقايضة"];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:py-14">
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-medium text-clay">بدّلها — Swap Marketplace</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
          بدّل الحاجة بدل ما تسيبها مركونة.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700 md:text-lg">
          بدّلها مكان للمقايضة بين الناس: تعرض الحاجة اللي عندك، وتكتب إنت محتاج إيه، وتستقبل عروض،
          ولما العرض يناسبك توافق وتكمّلوا الصفقة، وبعد الإتمام كل طرف يقيّم التاني.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/items/new" className="rounded-xl bg-clay px-5 py-3 text-white">
            اعرض حاجة
          </Link>
          <Link href="/items" className="rounded-xl border border-stone-300 px-5 py-3">
            شوف السوق
          </Link>
          <Link href="/how-it-works" className="rounded-xl px-5 py-3 text-stone-700 underline-offset-4 hover:underline">
            إزاي بتشتغل؟
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
        <SectionHeading title="الموضوع بيمشي في 4 خطوات" />
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm font-medium text-stone-800">
              <span className="mb-2 block text-xs text-stone-500">خطوة {index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:grid-cols-3 md:p-8">
        <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-700">مفيش بيع إجباري.</p>
        <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-700">مفيش أرقام موبايل عامة.</p>
        <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-700">التقييمات بتظهر بعد المقايضة المكتملة فقط.</p>
      </section>
    </div>
  );
}
