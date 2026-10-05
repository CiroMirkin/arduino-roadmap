# C++ Build Resolver — Embedded / Arduino / ESP32 / PlatformIO

## Flash overflow ("sketch too big" / "text section exceeds available space")

- Check **Partition Scheme** (Arduino IDE: *Tools > Partition Scheme*) — the default scheme on many ESP32 boards is ~1.25 MB for the app, which is too small for projects using heavy display/graphics libraries. Switch to a scheme with more app space (e.g. "Huge APP (3MB No OTA/1MB SPIFFS)"), noting that this usually removes room for OTA updates — flag that tradeoff explicitly if OTA matters for the project.
- Heavy libraries (graphics/display drivers, full `ArduinoJson` with excessive buffer sizes, verbose debug logging compiled in) are the usual bloat sources — check `#define CORE_DEBUG_LEVEL` and similar verbosity flags aren't left at a high level in a release build.
- PlatformIO: check `board_build.partitions` in `platformio.ini` matches intent, and run `pio run -v` to see a size breakdown per library if it's unclear what's consuming space.

## "PSRAM not found" / boots with garbled or blank display

- If the project needs PSRAM (common for larger display framebuffers), confirm PSRAM is enabled in board options (Arduino IDE: *Tools > PSRAM > OPI PSRAM* or *Enabled*, matching the board's actual PSRAM type — QSPI vs OPI differ by board). A board that physically has PSRAM but has it disabled in software will behave as if PSRAM doesn't exist, and some firmware intentionally aborts/blinks an error pattern when it detects this rather than silently failing later.
- Double check the board selection itself matches the physical board exactly — many ESP32-S3 variants exist with different PSRAM wiring (octal vs quad), and picking the wrong "ESP32S3 Dev Module" sub-variant can misconfigure PSRAM init even with the right menu settings.

## Library version conflicts

- Two libraries pinned to incompatible major versions of a shared dependency is a classic failure (e.g. one library expecting `ArduinoJson` v6's `StaticJsonDocument<N>` API, another expecting v7's `JsonDocument`). Check `library.json`/`library.properties` version constraints, and if code needs to support both, guard with `#if ARDUINOJSON_VERSION_MAJOR >= 7` style conditionals rather than picking one version and breaking the other library.
- "multiple definition of" errors when two libraries both bundle a copy of the same underlying dependency — check the Library Manager for duplicate/conflicting installs (sometimes a library is present both as a Library Manager install and a manually-dropped ZIP under `libraries/`), and remove the duplicate.
- A library that "worked yesterday" and now doesn't after an update: check the library's CHANGELOG for a breaking API change, and consider pinning the exact version in `platformio.ini` (`lib_deps = author/LibName@^1.2.3`) instead of floating on "latest."

## Board/toolchain not found

- "Board not found" / board option missing from the menu: the board package (e.g. Espressif's `esp32` package via Boards Manager URL) isn't installed, or is an old version that predates this specific board variant — reinstall/update the board package.
- Arduino IDE 2.x vs 1.x: menu locations and package manager behavior differ; confirm which version the user is on before giving menu-path instructions.

## Upload failures (port/connection)

- "Failed to connect to ESP32: Timed out waiting for packet header" or similar: usually a boot-mode issue — some boards need a manual BOOT button hold during the exact moment the upload tool resets the chip; check the board's specific reset circuit (auto-reset via DTR/RTS works on most dev boards but not all breakout designs).
- Wrong COM/serial port selected, or the port is held open by another program (a Serial Monitor window, another IDE instance) — close other serial connections before uploading.
- Driver missing for the board's USB-to-serial chip (CP2102, CH340, native USB on some ESP32-S3 boards) — check the OS has the right driver installed, especially on Windows.

## PlatformIO-specific

- Stale `.pio/build/` cache after a `platformio.ini` change (board, framework, or partition change) — `pio run --target clean` before rebuilding if the symptom doesn't match the current config.
- `lib_deps` resolution conflicts: run `pio pkg list` to see what actually got installed vs. what's declared, since PlatformIO's dependency resolution can silently pick a different version than expected when multiple libraries constrain the same dependency.

## General first steps before deep debugging

1. Read the **first** error in the log — a cascading library/include failure can produce dozens of follow-on errors from one root cause.
2. Confirm board selection and board-specific menu options (PSRAM, partition scheme, flash size, upload speed) match the actual physical board.
3. Try a full clean rebuild before assuming the error is in the code rather than stale build state.
