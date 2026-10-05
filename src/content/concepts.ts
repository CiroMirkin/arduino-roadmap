import { parse as parseYaml } from 'yaml';

export type QuizOption = {
  text: string;
  correct: boolean;
  explanation: string;
};

export type Quiz = {
  prompt: string;
  options: QuizOption[];
};

type Level = 'ESTUDIAR' | 'CONOCER';

// Una lección por concepto: un .md en ./conceptos, con el quiz en el frontmatter.
export type Concept = {
  id: string;
  slug: string;
  partSlug: string;
  title: string;
  level: Level;
  relacionado?: string;
  quizzes: Quiz[];
  cuerpo: string;
};

type Frontmatter = {
  id: string;
  parte: string;
  titulo: string;
  nivel: Level;
  relacionado?: string;
  quiz?: Quiz[];
};

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const desdeMarkdown = (ruta: string, contenido: string): Concept => {
  const slug = ruta.replace(/^.*\//, '').replace(/\.md$/, '');
  const partes = FRONTMATTER.exec(contenido);
  if (!partes) throw new Error(`${ruta}: falta el frontmatter`);
  const fm = parseYaml(partes[1] ?? '') as Frontmatter;
  for (const campo of ['id', 'parte', 'titulo', 'nivel'] as const) {
    if (!fm[campo]) throw new Error(`${ruta}: falta "${campo}" en el frontmatter`);
  }
  return {
    id: fm.id,
    slug,
    partSlug: fm.parte,
    title: fm.titulo,
    level: fm.nivel,
    ...(fm.relacionado ? { relacionado: fm.relacionado } : {}),
    quizzes: fm.quiz ?? [],
    cuerpo: partes[2] ?? '',
  };
};

const archivos = import.meta.glob('./conceptos/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const concepts: Concept[] = Object.entries(archivos).map(([ruta, contenido]) =>
  desdeMarkdown(ruta, contenido),
);

export const getAllConcepts = (): Concept[] => concepts;

export const getConceptBySlug = (slug: string): Concept | undefined =>
  concepts.find((c) => c.slug === slug);

export const getConceptsByPart = (partSlug: string): Concept[] =>
  concepts
    .filter((c) => c.partSlug === partSlug)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

export const getAllConceptSlugs = (): string[] => concepts.map((c) => c.slug);
