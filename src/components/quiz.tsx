'use client';

import { useState } from 'react';

// El texto llega ya convertido a HTML desde el servidor (Markdown inline y bloques de codigo).
export type QuizRenderizado = {
  promptHtml: string;
  options: {
    textHtml: string;
    correct: boolean;
    explanationHtml: string;
  }[];
};

type QuizProps = {
  quiz: QuizRenderizado;
  numero: number;
  total: number;
};

export const QuizCard = ({ quiz, numero, total }: QuizProps) => {
  const [selected, setSelected] = useState<number | null>(null);

  const answered = selected !== null;

  const optionClasses = (index: number, correct: boolean) => {
    if (!answered) {
      return 'border-ink/14 bg-surface hover:border-accent/40 hover:bg-accent/5';
    }
    if (index === selected && correct) {
      return 'border-success/50 bg-success/10';
    }
    if (index === selected && !correct) {
      return 'border-danger/50 bg-danger/10';
    }
    // Si erró, la correcta queda un poco atenuada para compararla con la elegida.
    if (correct) {
      return 'border-success/50 bg-success/10 opacity-80';
    }
    return 'border-ink/10 bg-surface opacity-60';
  };

  return (
    <div className="my-6 rounded-xl border border-ink/12 bg-code-bg/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-canvas">
          {total > 1 ? `Pregunta ${numero} de ${total}` : 'Quiz'}
        </span>
        <span className="text-xs text-ink/44">
          Elegí una opción para ver si es correcta
        </span>
      </div>

      <div
        className="leccion quiz-prompt mb-4 font-medium text-ink/90"
        dangerouslySetInnerHTML={{ __html: quiz.promptHtml }}
      />

      <div className="flex flex-col gap-2">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelected(index)}
            disabled={answered}
            className={`leccion rounded-lg border px-4 py-3 text-left text-sm transition-colors ${optionClasses(
              index,
              option.correct,
            )} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span
              className="font-medium text-ink/90"
              dangerouslySetInnerHTML={{ __html: option.textHtml }}
            />
            {answered && (index === selected || option.correct) && (
              <span className="mt-2 block text-sm font-normal text-ink/70">
                {index !== selected ? 'Esta es la correcta. ' : option.correct ? 'Correcto. ' : 'No es correcto. '}
                <span dangerouslySetInnerHTML={{ __html: option.explanationHtml }} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
