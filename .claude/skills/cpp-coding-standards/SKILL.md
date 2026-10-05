---
name: cpp-coding-standards
description: Apply modern C++ coding standards and conventions when writing, reviewing, or modernizing C++ code (.cpp, .h, .hpp, .ino files). Covers naming, class structure, enums, memory management, const-correctness, and header organization. Use this whenever the user writes new C++/Arduino/ESP32 code, asks "is this good C++", asks to modernize or clean up old C++ patterns (e.g. enum vs enum class, #define vs constexpr, raw pointers vs smart pointers, C-style casts), or asks for a code review focused on style/idioms rather than bugs. Covers both desktop/server C++ (CMake, STL, exceptions) and embedded/Arduino C++ (microcontrollers, no exceptions, tight RAM/flash) — pick the right reference automatically.
---

# C++ Coding Standards

Two very different worlds both call themselves "C++": desktop/server C++ (full STL, exceptions, dynamic allocation, CMake) and embedded C++ for microcontrollers (Arduino/ESP32/AVR — usually no exceptions, limited RAM/flash, often no heap after setup). A rule that's excellent advice in one world is sometimes actively wrong in the other (e.g. "never use raw pointers" makes sense with `std::unique_ptr` and `new`/`delete` pairs on a desktop; on an 8-bit micro with 2 KB of RAM, a raw pointer assigned once in `setup()` and never freed is normal and `std::unique_ptr` may not even be available).

**Before giving any advice, figure out which world the code lives in:**

- Includes `<Arduino.h>`, uses `.ino` files, `setup()`/`loop()`, `pinMode`, `digitalWrite`, `BLEDevice`, `WiFi.h`, `Preferences.h`, targets an ESP32/AVR/STM32 board, or is built with the Arduino IDE/PlatformIO → **embedded**. Read `references/embedded.md`.
- Uses CMake/Make, targets Linux/macOS/Windows or a server, links against the full STL, uses exceptions, or there's no hint of a microcontroller → **desktop**. Read `references/desktop.md`.
- Genuinely unclear (e.g. a header with no includes) → ask the user, or infer from surrounding files in the project before guessing.

Load only the reference file that matches — don't load both, they recommend opposite things in places (e.g. smart pointers vs raw owning pointers) and mixing the advice will confuse the output.

## How to use this skill

1. Identify the world (above).
2. Read the matching reference file in full before making recommendations — it has the concrete rules, the reasoning behind each one, and good/bad examples.
3. When reviewing existing code, point out violations with a one-line reason tied to *why* it matters in that world (not just "this is the modern way") — e.g. "a plain `enum` here leaks its values (`CALIB_OK`) into the enclosing scope; `enum class` would let you drop the `CALIB_` prefix and avoid accidental `int` comparisons."
4. When writing new code, just follow the standard — don't narrate every choice unless asked.
5. If a project mixes both worlds (e.g. a repo with a `desktop-tools/` CLI and a `firmware/` folder), apply the matching standard per file/directory, not a single standard to the whole repo.

## Quick index

| Reference | Covers |
|---|---|
| `references/desktop.md` | RAII, smart pointers, STL containers/algorithms, `constexpr`, move semantics, concepts/templates, exception safety, CMake project layout, naming |
| `references/embedded.md` | `enum class`, `static`/`volatile`, memory-conscious patterns, `String` vs `char[]`, avoiding dynamic allocation in `loop()`, ISR-safe code, non-blocking state machines, header guards, interrupt/callback patterns |
