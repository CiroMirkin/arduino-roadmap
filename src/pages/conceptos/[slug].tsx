import { Link } from 'waku';
import {
  getAllConceptSlugs,
  getConceptBySlug,
  getConceptsByPart,
  type Concept,
  type Quiz,
} from '../../content/concepts';
import { getPartBySlug, partLabel } from '../../content/parts';
import { LevelBadge } from '../../components/level-badge';
import { QuizCard, type QuizRenderizado } from '../../components/quiz';
import { InlineMd, textoPlano } from '../../components/inline-md';
import { renderInline, renderMarkdown } from '../../lib/markdown';

type ConceptPageProps = {
  slug: string;
};

const MARCA_QUIZ = '<!-- quiz -->';

const renderQuiz = async (quiz: Quiz): Promise<QuizRenderizado> => ({
  promptHtml: await renderMarkdown(quiz.prompt),
  options: await Promise.all(
    quiz.options.map(async (o) => ({
      textHtml: await renderInline(o.text),
      correct: o.correct,
      explanationHtml: await renderInline(o.explanation),
    })),
  ),
});

const SeccionQuiz = async ({ slug, quizzes }: { slug: string; quizzes: Quiz[] }) => {
  if (quizzes.length === 0) return null;
  const renderizados = await Promise.all(quizzes.map(renderQuiz));
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-ink">Comprobá lo que entendiste</h2>
      {renderizados.map((quiz, i) => (
        // La key incluye el slug para que al cambiar de lección el quiz arranque sin responder.
        <QuizCard key={`${slug}-${i}`} quiz={quiz} numero={i + 1} total={renderizados.length} />
      ))}
    </div>
  );
};

const CuerpoLeccion = async ({ concept }: { concept: Concept }) => {
  const [antes = '', despues = ''] = concept.cuerpo.split(MARCA_QUIZ);
  const [htmlAntes, htmlDespues] = await Promise.all([
    renderMarkdown(antes),
    renderMarkdown(despues),
  ]);
  return (
    <>
      <div className="leccion mt-6" dangerouslySetInnerHTML={{ __html: htmlAntes }} />
      <SeccionQuiz slug={concept.slug} quizzes={concept.quizzes} />
      {despues.trim() && (
        <div className="leccion mt-10" dangerouslySetInnerHTML={{ __html: htmlDespues }} />
      )}
    </>
  );
};

export default async function ConceptPage({ slug }: ConceptPageProps) {
  const concept = getConceptBySlug(slug);

  if (!concept) {
    return (
      <div>
        <p>Este concepto no existe.</p>
        <Link to="/" className="underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const part = getPartBySlug(concept.partSlug);
  const relacionado = concept.relacionado ? getConceptBySlug(concept.relacionado) : undefined;
  const siblings = getConceptsByPart(concept.partSlug);
  const index = siblings.findIndex((c) => c.slug === concept.slug);
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index < siblings.length - 1 ? siblings[index + 1] : undefined;

  return (
    <div>
      <title>{`${concept.id} ${textoPlano(concept.title)}`}</title>

      <Link to={`/partes/${concept.partSlug}`} className="text-sm text-accent hover:underline">
        {part ? `${partLabel(part)} — ${part.title}` : 'Volver'}
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <h1 className="leccion-titulo text-2xl font-semibold tracking-tight text-ink">
          <span className="mr-2 font-mono text-ink/44">{concept.id}</span>
          <InlineMd texto={concept.title} />
        </h1>
        <LevelBadge level={concept.level} />
      </div>

      <CuerpoLeccion concept={concept} />

      {relacionado && (
        <p className="mt-8 rounded-lg border border-ink/10 bg-surface px-5 py-4 text-sm text-ink/64">
          Para profundizar:{' '}
          <Link to={`/conceptos/${relacionado.slug}`} className="text-accent hover:underline">
            {relacionado.id} <InlineMd texto={relacionado.title} /> {'->'}
          </Link>
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-ink/10 pt-6 text-sm">
        {prev ? (
          <Link to={`/conceptos/${prev.slug}`} className="text-accent hover:underline">
            {'<- '}
            {prev.id} <InlineMd texto={prev.title} />
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/conceptos/${next.slug}`} className="text-right text-accent hover:underline">
            {next.id} <InlineMd texto={next.title} />
            {' ->'}
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

export const getConfig = async () => {
  const staticPaths = getAllConceptSlugs();
  return {
    render: 'static',
    staticPaths,
  } as const;
};
