# C++ Coding Standards — Embedded / Arduino / ESP32

Context: microcontroller firmware (Arduino framework, ESP-IDF, PlatformIO), tight RAM/flash budgets, usually built with exceptions and RTTI disabled, `setup()`/`loop()` structure, no OS-level memory protection. Standard desktop C++ advice ("always use smart pointers", "use `std::string`") often doesn't apply here — the goal is predictable memory use and timing, not generality.

## Enums: always `enum class`, never plain `enum`

A plain `enum` leaks its enumerator names into the surrounding scope, which is why embedded codebases end up hand-prefixing everything (`ESTADO_SCAN`, `ERROR_LOTE_NINGUNO`) to avoid collisions. `enum class` scopes the names under the type itself and never silently converts to `int`.

```cpp
// Old
enum Estado { ESTADO_SCAN, ESTADO_INPUT, ESTADO_MEASURING };

// Modern
enum class Estado { Scan, Input, Measuring };
// usage: Estado::Scan — no prefix needed, the type name gives the context
```

This is a pure win on microcontrollers: zero runtime cost, same memory layout, just better scoping. Apply it to every new enum and flag every plain `enum` found during review.

## Constants: `#define` is still common, but prefer `constexpr` where it compiles cleanly

`#define` is pervasive in Arduino code (pin numbers, timeouts, buffer sizes) because older toolchains leaned on it and because it's what most example code shows. On ESP32-class chips (unlike old AVR 8-bit boards) there's no meaningful cost to `constexpr`, so prefer it for anything that isn't conditional compilation:

```cpp
// Old (still extremely common, not wrong, just not the best option available today)
#define PMW3901_CS 17

// Preferred when you control the file
constexpr int PMW3901_CS = 17;
```

Don't rewrite a whole existing `config.h` of `#define`s just for this — it's a style nit, not a bug. Do use `constexpr` in new code you write.

## Memory: avoid dynamic allocation after `setup()`

Heap fragmentation is a real failure mode on long-running embedded devices (days/weeks of uptime) — small, differently-sized allocations and frees over time can fragment the heap until a large allocation fails even though total free memory looks sufficient.

- Prefer fixed-size buffers (`char buf[64]`), stack allocation, and pre-sized structures allocated once in `setup()`.
- The Arduino `String` class allocates on the heap on every concatenation. It's fine for occasional use (building a log line) but avoid it in hot paths or anything called every `loop()` iteration — prefer `char[]` with `snprintf`/manual copying, or keep ownership of the buffer explicit (as a parser that writes into a caller-provided fixed array, for example).
- `new` without a matching `delete` is a normal, intentional pattern for objects that live for the entire program (a BLE server's callback object, a driver instance) — this is not a leak, it's a deliberately "forever" allocation. `std::unique_ptr` is fine to use for these too if available in your toolchain, but don't treat its absence as a correctness problem.

## `volatile`, `static`, and shared state

- Mark any variable touched from an interrupt handler or a library callback (BLE notify, ISR) `volatile` so the compiler doesn't cache a stale value in a register while the main loop spins waiting for it to change.
- A `static` pointer to "the one instance" of a class is the standard way to bridge a C-style callback API (which can't carry a `this` pointer) back into your C++ object — this is a legitimate, minimal singleton pattern here, not an anti-pattern to avoid.
- Keep anything touched from an ISR or callback short and non-blocking — set a flag or copy a value, handle the real work in `loop()`.

## Structure: `loop()` must never block

- No `delay()` in production logic beyond trivial, truly one-shot setup code — it freezes BLE, WiFi, and UI responsiveness. Use `millis()`-based timers instead (`if (millis() - lastMs > intervalMs) { ... }`).
- Model multi-step processes (WiFi connect, HTTP request with retries, a calibration wizard) as explicit non-blocking state machines with an `enum class State` and a `switch` in `update()`, not as a sequence of blocking calls.

## Casts and types

- Prefer `static_cast<int>(x)` over `(int)x` — same runtime behavior, but it documents intent and is easy to grep for later.
- `uint8_t`/`uint16_t`/`uint32_t` (from `<stdint.h>`, or implicitly via `Arduino.h`) over plain `int`/`long` when the size matters for a protocol, a register, or a buffer — makes the on-wire/on-register layout unambiguous.

## Headers

- `#ifndef`/`#define`/`#endif` guards are the traditional form and still completely valid; `#pragma once` is shorter and supported by every modern embedded toolchain (GCC/Clang for ESP32, AVR-GCC) if you're starting a new header. Don't bother converting existing guards — it's cosmetic.
- Forward-declare classes in headers when you only need a pointer/reference, to avoid pulling heavy driver headers (BLE, display libraries) into every file that includes yours and slowing the build.

## Callback patterns

- Libraries that require you to inherit from a callback base class and override virtual methods (`BLEServerCallbacks`, `BLEAdvertisedDeviceCallbacks`) are the normal pattern here — mark overrides with `override` so the compiler catches a signature mismatch against the base class instead of silently creating a new, never-called method.

## Good vs. bad example

```cpp
// Old style
enum TipoErrorLote { ERROR_LOTE_NINGUNO, ERROR_LOTE_NO_ENCONTRADO };
#define MAX_DIGITOS 8
void procesar(int index) {
    int valor = (int)obtenerValor(index);
    ...
}

// Modernized, same memory footprint, same performance
enum class TipoErrorLote { Ninguno, NoEncontrado };
constexpr int MAX_DIGITOS = 8;
void procesar(int index) {
    int valor = static_cast<int>(obtenerValor(index));
    ...
}
```
