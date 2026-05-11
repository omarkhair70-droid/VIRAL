export function SwapCard({ swap, note, demoLabel }: { swap: string; note: string; demoLabel?: boolean }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      {demoLabel ? <span className="mb-2 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">أمثلة على شكل الصفقات</span> : null}
      <h3 className="text-lg font-semibold text-gray-900">{swap}</h3>
      <p className="mt-2 text-sm leading-7 text-gray-600">{note}</p>
    </article>
  );
}
