import { renderInline } from '../lib/markdown';

// Titulos y textos cortos con Markdown inline (por ejemplo `codigo`).
export const InlineMd = async ({ texto }: { texto: string }) => {
  const html = await renderInline(texto);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export const textoPlano = (texto: string) => texto.replace(/`/g, '');
