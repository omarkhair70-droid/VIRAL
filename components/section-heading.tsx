export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-3xl text-gray-600">{subtitle}</p> : null}
    </div>
  );
}
