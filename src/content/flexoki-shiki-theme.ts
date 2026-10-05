import type { ThemeRegistration } from 'shiki';

const paper = '#f2f0e5';
const ink900 = '#100f0f';
const ink700 = '#403e3c';
const ink500 = '#6f6e69';
const ink300 = '#b7b5ac';
const red = '#af3029';
const orange = '#bc5215';
const yellow = '#ad8301';
const green = '#66800b';
const cyan = '#24837b';
const blue = '#205ea6';
const purple = '#5e409d';
const magenta = '#a02f6f';

export const flexokiLight: ThemeRegistration = {
  name: 'flexoki-light',
  type: 'light',
  colors: {
    'editor.background': paper,
    'editor.foreground': ink900,
  },
  bg: paper,
  fg: ink900,
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: ink300, fontStyle: 'italic' },
    },
    {
      scope: ['string', 'string.quoted', 'string.template'],
      settings: { foreground: green },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: purple },
    },
    {
      scope: [
        'keyword',
        'keyword.control',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.operator.new',
      ],
      settings: { foreground: red, fontStyle: 'bold' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: orange },
    },
    {
      scope: [
        'entity.name.class',
        'entity.name.type',
        'entity.other.inherited-class',
        'support.class',
        'support.type',
      ],
      settings: { foreground: yellow },
    },
    {
      scope: ['variable', 'variable.other', 'variable.parameter'],
      settings: { foreground: ink900 },
    },
    {
      scope: ['variable.other.property', 'meta.object-literal.key'],
      settings: { foreground: cyan },
    },
    {
      scope: ['entity.other.attribute-name', 'entity.name.tag'],
      settings: { foreground: blue },
    },
    {
      scope: ['punctuation', 'meta.brace', 'keyword.operator'],
      settings: { foreground: ink700 },
    },
    {
      scope: ['constant.other.placeholder', 'variable.language'],
      settings: { foreground: magenta },
    },
  ],
};
