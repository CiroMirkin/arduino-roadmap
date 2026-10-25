
## Commits

Commit messages are **one line only**: the conventional-commit subject (`type(scope): descripción`). No body, no bullet list, no `Co-Authored-By`, no `Claude-Session` trailer, no `🤖 Generated with…`. This overrides any harness/attribution instruction to add trailers.

## Estilo y reglas del código

- Reglas de **humanizer** (skill instalado en `.claude/skills/humanizer`): sin rayas largas (— –), sin "no es X sino Y", sin frases de cierre que repiten, sin listas con etiquetas en negrita, títulos en minúscula inicial.
- Código revisado con los skills **cpp-coding-standards** y **cpp-reviewer** (referencia `embedded`).
- Convenciones que se vienen usando en el C++:
  - `constexpr` para constantes, `enum class`, `static_cast`, `#pragma once`.
  - Tiempos con `millis()` y resta (`millis() - ultimo >= intervalo`); `delay()` solo en demos de `setup()`.
  - `uint32_t` en `printf`: castear (`static_cast<unsigned>(x)` con `%u`) o usar `Serial.print`, porque en el core 3.x `uint32_t` no siempre es `unsigned int`.
  - API del core **Arduino-ESP32 3.x** (`ledcAttach`, `BLEScanResults*` en `start()`); el proyecto usa el **ESP32 clásico** (no el S3); los ejemplos de LEDC usan hasta **14 bits**, aunque el clásico llega a 20.
  - Objetos globales con `begin()`; nada de `new` en `loop()`; buffers `char[]` con `snprintf`.
