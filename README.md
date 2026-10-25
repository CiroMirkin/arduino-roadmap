# Roadmap Arduino / ESP32 / Backend

Sitio estático hecho con [Waku](https://github.com/wakujs/waku) para aprender a construir un sistema de equipos conectados de punta a punta: C++ para firmware, Arduino y ESP32, arquitectura de firmware, conectividad, y un backend en Node, Express y PostgreSQL para varias organizaciones.

Todas las lecciones usan el mismo ejemplo: el control de un invernadero, con nodos sensores a batería (BLE, deep sleep), un controlador ESP32 que maneja el riego y la ventilación, y un backend donde cada productor tiene sus invernaderos, equipos y usuarios con roles.

## Contenido

- 11 partes: la Base (C++), la Parte 0 (Arduino y ESP32) y las Partes 1 a 9.
- 73 lecciones (`/conceptos/<slug>`), de dos tipos:
  - ESTUDIAR: idea central, por qué te importa, paso a paso, tres o más ejemplos, errores comunes, un ejercicio con pista y solución, un quiz de cuatro preguntas y un resumen.
  - CONOCER: una versión más liviana, con cómo funciona, uno o dos ejemplos, cuándo conviene y cuándo no, y un quiz de dos preguntas.

## Cómo correrlo

Requiere Node.js 20 o más nuevo.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Sitio estático

```bash
npm run build
```

Genera `dist/public/` con HTML, CSS y JS ya compilados, que se puede servir con cualquier hosting de archivos estáticos.

## Estructura

```text
src/
  content/
    conceptos/<slug>.md   una lección por concepto (frontmatter con id, parte, título, nivel, relacionado y quiz)
    concepts.ts           carga los .md y los expone ordenados por parte
    parts.ts              las partes del roadmap
  lib/
    markdown.ts           marked + shiki: Markdown a HTML con resaltado de código
  components/
    quiz.tsx              quiz interactivo ('use client')
    inline-md.tsx         títulos con `código` en listas y navegación
    level-badge.tsx       ESTUDIAR / CONOCER
  pages/
    index.tsx             listado de las partes
    partes/[part].tsx     conceptos de una parte
    conceptos/[slug].tsx  una lección
tools/
  verificar-ejemplos.py   compila los ejemplos de C++ completos contra el core esp32
```

## Escribir una lección

Cada archivo empieza con un frontmatter en YAML:

```markdown
---
id: '2.3'
parte: parte-2
titulo: 'Título con `código` si hace falta'
nivel: ESTUDIAR
relacionado: 0-1
quiz:
  - prompt: '¿Pregunta?'
    options:
      - text: 'Opción'
        correct: false
        explanation: 'Por qué no.'
---
```

El cuerpo es Markdown. Los bloques de código llevan el lenguaje y una etiqueta opcional (` ```cpp sensor.ino `), los links internos son `/conceptos/<slug>`, y `<!-- quiz -->` marca dónde va el quiz.

## Verificar los ejemplos de C++

```bash
python tools/verificar-ejemplos.py b- 0- 1-
```

Usa el `arduino-cli` del Arduino IDE 2 con el core esp32 3.x. Solo compila los bloques que tienen `setup()` y `loop()`; los fragmentos que llaman funciones sin definir fallan con `was not declared`, y eso es esperable.
