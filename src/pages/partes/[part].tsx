import { Link } from 'waku';
import { getAllPartSlugs, getPartBySlug, partLabel } from '../../content/parts';
import { getConceptsByPart } from '../../content/concepts';
import { LevelBadge } from '../../components/level-badge';
import { InlineMd } from '../../components/inline-md';

type PartPageProps = {
  part: string;
};

export default async function PartPage({ part: partSlug }: PartPageProps) {
  const part = getPartBySlug(partSlug);

  if (!part) {
    return (
      <div>
        <p>Esta parte no existe.</p>
        <Link to="/" className="underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const concepts = getConceptsByPart(part.slug);

  return (
    <div>
      <title>{`${partLabel(part)} — ${part.title}`}</title>

      <Link to="/" className="text-sm text-accent hover:underline">
        Todas las partes
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-ink/44">
            {partLabel(part)}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {part.title}
          </h1>
        </div>
        <LevelBadge level={part.level} />
      </div>

      <p className="mt-3 text-ink/70">{part.description}</p>

      {part.sources && part.sources.length > 0 && (
        <p className="mt-2 text-sm text-ink/44">
          Fuente:{' '}
          {part.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ', '}
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink/70"
              >
                {s.label}
              </a>
            </span>
          ))}
        </p>
      )}

      <div className="mt-8 flex flex-col">
        {concepts.map((concept, i) => (
          <Link
            key={concept.slug}
            to={`/conceptos/${concept.slug}`}
            className={`flex items-center justify-between py-3 hover:bg-ink/[0.02] ${
              i > 0 ? 'border-t border-ink/10' : ''
            }`}
          >
            <span className="text-ink/80">
              <span className="mr-2 font-mono text-sm text-ink/44">
                {concept.id}
              </span>
              <InlineMd texto={concept.title} />
            </span>
            <span className="shrink-0">
              <LevelBadge level={concept.level} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const getConfig = async () => {
  const staticPaths = getAllPartSlugs();
  return {
    render: 'static',
    staticPaths,
  } as const;
};
