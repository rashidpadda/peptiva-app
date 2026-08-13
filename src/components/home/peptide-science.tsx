const POINTS = [
  {
    title: "What are peptides?",
    body: "Short chains of amino acids — the same building blocks that make up proteins in the skin. They're commonly included in cosmetic formulations for their role in supporting the skin's natural-looking structure.",
  },
  {
    title: "How we use them",
    body: "Each PEPTIVA formula combines specific peptide types at meaningful concentrations, paired with complementary ingredients designed to support absorption and comfort.",
  },
  {
    title: "What to expect",
    body: "Most customers report visible changes to texture and firmness within 4-8 weeks of consistent, daily use as part of a complete routine.",
  },
];

export function PeptideScience() {
  return (
    <section id="peptide-science" className="bg-charcoal py-20 text-ivory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-champagne">
            Peptide Science
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
            Small molecules. Thoughtful formulas.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ivory/70">
            Peptides are short chains of amino acids used in cosmetic formulations and are
            commonly included in skincare products designed to support the appearance of skin.
          </p>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {POINTS.map((point, i) => (
            <div key={point.title} className="border-t border-ivory/15 pt-6">
              <span className="font-serif text-3xl text-champagne">
                0{i + 1}
              </span>
              <h3 className="mt-4 text-base font-medium">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/60">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
