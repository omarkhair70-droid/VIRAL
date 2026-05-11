export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-gray-600">{hint}</p>
      <p className="mt-4 text-sm text-clay">المرحلة الجاية هتكمّل التفاصيل.</p>
    </div>
  );
}
