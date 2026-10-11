export function SectionHead({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <div className="section-head" data-reveal>
      <p className="eyebrow">
        <span>{index}</span> {label}
      </p>
      <h2>{title}</h2>
    </div>
  );
}
