import { toSentenceCase } from '../lib/format';

type LevelBadgeProps = {
  level: string;
};

export const LevelBadge = ({ level }: LevelBadgeProps) => {
  const isEstudiar = level.startsWith('ESTUDIAR');

  const classes = isEstudiar
    ? 'border-accent/30 bg-accent/10 text-accent'
    : 'border-ink/18 bg-transparent text-ink/64';

  return (
    <span
      className={`inline-block shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {toSentenceCase(level)}
    </span>
  );
};
