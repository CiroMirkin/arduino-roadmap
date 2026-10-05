export type Part = {
  slug: string;
  number: number;
  label?: string;
  title: string;
  level: string;
  description: string;
  sources?: { label: string; url: string }[];
};

export const parts: Part[] = [
  {
    slug: 'base',
    number: -1,
    label: 'Base',
    title: 'C++ para firmware',
    level: 'ESTUDIAR antes de la Parte 1',
    description:
      'Los fundamentos del lenguaje que aparecen en cualquier firmware: tipos, preprocesador, clases, punteros y referencias, const, static, memoria, herencia, enums y cadenas.',
  },
  {
    slug: 'parte-0',
    number: 0,
    title: 'Arduino y ESP32',
    level: 'ESTUDIAR antes de la Parte 1',
    description:
      'Cómo funciona la placa: el ciclo setup/loop, memorias, pines, ADC, PWM, buses (UART, I2C, SPI), interrupciones, BLE, WiFi, almacenamiento permanente, deep sleep y librerías.',
  },
  {
    slug: 'parte-1',
    number: 1,
    title: 'C++ aplicado a firmware',
    level: 'ESTUDIAR',
    description:
      'Cómo usar el lenguaje para diseñar firmware ordenado: responsabilidades separadas, composición, dueños de los objetos, módulos, const, patrones simples y un proyecto en PlatformIO.',
    sources: [
      {
        label: 'C++ Roadmap (nilbuild/developer-roadmap, el proyecto roadmap.sh)',
        url: 'https://github.com/nilbuild/developer-roadmap',
      },
    ],
  },
  {
    slug: 'parte-2',
    number: 2,
    title: 'Arquitectura de firmware Arduino/ESP32',
    level: 'ESTUDIAR',
    description:
      'Cómo organizar un firmware que crece: capas, máquinas de estados, código no bloqueante, FreeRTOS, interrupciones, manejo de errores, OTA y pruebas fuera del hardware.',
  },
  {
    slug: 'parte-3',
    number: 3,
    title: 'Conectividad y comunicación del ESP32',
    level: 'ESTUDIAR',
    description:
      'Cómo los equipos del invernadero hablan con el backend de forma confiable: reconexión, HTTP o MQTT, JSON, autenticación de equipos y reintentos idempotentes.',
  },
  {
    slug: 'parte-4',
    number: 4,
    title: 'Backend: arquitectura para varias organizaciones',
    level: 'ESTUDIAR',
    description:
      'Un backend en Node, Express y PostgreSQL para muchos productores: aislamiento por organización, roles y permisos, ingesta idempotente, límites de pedidos, índices, colas y observabilidad.',
    sources: [
      {
        label: 'Backend Roadmap y API Design Roadmap (nilbuild/developer-roadmap)',
        url: 'https://github.com/nilbuild/developer-roadmap',
      },
    ],
  },
  {
    slug: 'parte-5',
    number: 5,
    title: 'Bases de datos y consistencia',
    level: 'ESTUDIAR lo básico, CONOCER lo avanzado',
    description:
      'Modelado relacional, transacciones y, más adelante, consistencia eventual y caché con Redis.',
    sources: [
      {
        label: 'liquidslr/system-design-notes',
        url: 'https://github.com/liquidslr/system-design-notes',
      },
      {
        label: 'david8zhang/system-design-notes',
        url: 'https://github.com/david8zhang/system-design-notes',
      },
    ],
  },
  {
    slug: 'parte-6',
    number: 6,
    title: 'Seguridad',
    level: 'ESTUDIAR',
    description:
      'Secretos fuera del código y del firmware, permisos verificados en el backend y datos de los equipos tratados como entrada no confiable.',
  },
  {
    slug: 'parte-7',
    number: 7,
    title: 'Falsehoods: cosas que vas a asumir mal',
    level: 'CONOCER, muy útil igual',
    description:
      'Supuestos falsos comunes sobre el tiempo, las redes y los nombres, y cómo aparecen en un sistema de equipos y backend.',
    sources: [
      { label: 'kdeldycke/awesome-falsehood', url: 'https://github.com/kdeldycke/awesome-falsehood' },
    ],
  },
  {
    slug: 'parte-8',
    number: 8,
    title: 'Arquitectura de software avanzada',
    level: 'CONOCER, no es prioridad al principio',
    description:
      'Ideas para cuando el dominio y el equipo crecen: arquitectura hexagonal, DDD, CQRS, event sourcing y microservicios, con cuándo convienen y cuándo no.',
    sources: [
      {
        label: 'mehdihadeli/awesome-software-architecture',
        url: 'https://github.com/mehdihadeli/awesome-software-architecture',
      },
    ],
  },
  {
    slug: 'parte-9',
    number: 9,
    title: 'System design general',
    level: 'CONOCER, para cuando la escala crezca mucho',
    description:
      'Lo que cambia cuando un servidor ya no alcanza: balanceo de carga, límites distribuidos, sharding y el teorema CAP.',
    sources: [
      {
        label: 'david8zhang/system-design-notes',
        url: 'https://github.com/david8zhang/system-design-notes',
      },
      {
        label: 'liquidslr/system-design-notes',
        url: 'https://github.com/liquidslr/system-design-notes',
      },
    ],
  },
];

export const partLabel = (part: Part) => part.label ?? `Parte ${part.number}`;

export const getPartBySlug = (slug: string) => parts.find((p) => p.slug === slug);
export const getAllPartSlugs = () => parts.map((p) => p.slug);
