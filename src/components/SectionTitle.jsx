export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center mb-14">
      <p className="text-xs uppercase tracking-[0.4em] text-amber-500/70 font-bold mb-3">
        {eyebrow}
      </p>
      <h2 className="text-3xl md:text-5xl font-bold text-gradient-gold mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
