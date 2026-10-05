export const Footer = () => {
  return (
    <footer className="mx-auto max-w-4xl px-6 py-10 text-sm text-ink/44">
      <p>
        Construido con{' '}
        <a
          href="https://github.com/wakujs/waku"
          target="_blank"
          rel="noreferrer"
          className="text-ink/64 underline hover:text-ink"
        >
          Waku
        </a>
        . Roadmap personal de Arduino, ESP32 y arquitectura de backend multi-organización.
      </p>
    </footer>
  );
};
