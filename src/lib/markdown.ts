import { Marked, type Tokens } from 'marked';
import { codeToHtml } from 'shiki';
import { flexokiLight } from '../content/flexoki-shiki-theme';

const LANG_MAP: Record<string, string> = {
  cpp: 'cpp',
  js: 'javascript',
  jsx: 'jsx',
  sql: 'sql',
  nginx: 'nginx',
  ini: 'ini',
  bash: 'bash',
  json: 'json',
  text: 'text',
};

type CodeTokenResaltado = Tokens.Code & { resaltado?: string };

const escapar = (texto: string) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// La info del bloque de codigo es "<lenguaje> <etiqueta opcional>", por ejemplo: ```cpp sensor.ino
const leerInfo = (info: string | undefined) => {
  const [lang = 'text', ...resto] = (info ?? '').trim().split(/\s+/);
  return { lang: lang || 'text', etiqueta: resto.join(' ') };
};

export const resaltarCodigo = (code: string, lang: string) =>
  codeToHtml(code, { lang: LANG_MAP[lang] ?? 'text', theme: flexokiLight });

const marked = new Marked({
  async: true,
  gfm: true,
  async walkTokens(token) {
    if (token.type !== 'code') return;
    const code = token as CodeTokenResaltado;
    code.resaltado = await resaltarCodigo(code.text, leerInfo(code.lang).lang);
  },
  renderer: {
    link({ href, title, tokens }) {
      const texto = this.parser.parseInline(tokens);
      const externo = /^https?:\/\//.test(href);
      const atributos = [
        `href="${escapar(href)}"`,
        title ? `title="${escapar(title)}"` : '',
        externo ? 'target="_blank" rel="noreferrer"' : '',
      ].filter(Boolean);
      return `<a ${atributos.join(' ')}>${texto}</a>`;
    },
    code(token) {
      const { lang, etiqueta } = leerInfo(token.lang);
      const html = (token as CodeTokenResaltado).resaltado ?? `<pre>${escapar(token.text)}</pre>`;
      return `<div class="bloque-codigo">
<div class="bloque-codigo-cabecera"><span>${escapar(etiqueta)}</span><span>${escapar(lang)}</span></div>
<div class="shiki-wrapper">${html}</div>
</div>`;
    },
  },
});

export const renderMarkdown = (md: string): Promise<string> =>
  marked.parse(md) as Promise<string>;

export const renderInline = (md: string): Promise<string> =>
  marked.parseInline(md) as Promise<string>;
