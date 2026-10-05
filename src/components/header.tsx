import { Link } from 'waku';

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-ink/10 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-semibold tracking-tight text-ink">
          Roadmap Arduino / ESP32 / Backend
        </Link>
        <nav className="flex gap-4 text-sm text-ink/64">
          <Link to="/" className="hover:text-ink">
            Inicio
          </Link>
        </nav>
      </div>
    </header>
  );
};
