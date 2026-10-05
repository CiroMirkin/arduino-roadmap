import { Link } from 'waku';
import { partLabel, parts } from '../content/parts';
import { LevelBadge } from '../components/level-badge';

export default async function HomePage() {
  return (
    <div>
      <title>Roadmap Arduino / ESP32 / Backend</title>

      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Roadmap: Arduino, ESP32, C++ y backend para varias organizaciones
      </h1>
      <p className="mt-4 text-ink/70">
        Un recorrido para aprender a construir un sistema completo de equipos
        conectados, de punta a punta. El ejemplo que atraviesa todas las
        lecciones es el control de un invernadero: nodos sensores a batería que
        miden por BLE, un controlador ESP32 que maneja el riego y la
        ventilación, y un backend en Node y PostgreSQL que atiende a varios
        productores, cada uno con sus invernaderos y sus usuarios.
      </p>
      <p className="mt-3 text-ink/70">
        Cada concepto es una lección: la idea central, por qué importa, un paso
        a paso, ejemplos de código, errores comunes, un ejercicio y un quiz para
        comprobar lo que entendiste. Si sabés programar pero no C++, empezá por
        la Base y la Parte 0.
      </p>

      <div className="mt-10 flex flex-col gap-3">
        {parts.map((part) => (
          <Link
            key={part.slug}
            to={`/partes/${part.slug}`}
            className="block rounded-xl border border-ink/10 bg-surface p-5 transition-colors hover:border-ink/20 hover:bg-ink/[0.02]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-ink/44">
                  {partLabel(part)}
                </div>
                <h2 className="mt-1 text-lg font-semibold text-ink">
                  {part.title}
                </h2>
                <p className="mt-1 text-sm text-ink/64">{part.description}</p>
              </div>
              <LevelBadge level={part.level} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
