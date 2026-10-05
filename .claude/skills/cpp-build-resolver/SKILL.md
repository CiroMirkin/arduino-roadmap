---
name: cpp-build-resolver
description: Diagnose and fix C++ build/compile/link errors and Arduino/PlatformIO upload failures. Use this whenever the user pastes a compiler error, linker error, "undefined reference", template instantiation error, CMake configuration error, or an Arduino IDE/PlatformIO build or upload failure (flash overflow, board not found, library conflicts, PSRAM/partition errors), and asks why the build is failing or how to fix it. Covers both desktop/server C++ (CMake/Make, GCC/Clang/MSVC errors) and embedded/Arduino C++ (board packages, partition schemes, library version conflicts, upload/port issues).
---

# C++ Build Resolver

Build errors in C++ usually fall into a handful of recognizable shapes. The fix is almost always faster when you first classify *which* shape you're looking at instead of reading the full wall of template-error text top to bottom.

Identify desktop vs. embedded from the error itself and the project (an Arduino/PlatformIO build log, a `.ino`, board-related errors like "PSRAM", "partition scheme", "COM port" → embedded; a `CMakeError.log`, GCC/Clang/MSVC compiler invocation, a desktop OS target → desktop), then read the matching reference.

## How to use this skill

1. Read the **first** error in the log, not the last — in C++, one root cause (a missing include, a typo'd type) often cascades into dozens of follow-on errors. Fix the first one and rebuild before chasing the rest.
2. Classify the error using the matching reference's table.
3. Explain the actual cause in plain terms before giving the fix — "the linker can't find the implementation of `Foo::bar()`" is more useful than just pasting a working CMakeLists.txt.
4. If the fix requires a destructive or hard-to-reverse step (reformatting a partition, erasing flash, clearing a `build/` dir with `--purge`), say so and confirm with the user if it's not an obviously safe thing to do.

## Quick index

| Reference | Covers |
|---|---|
| `references/desktop.md` | "undefined reference" linker errors, template instantiation errors, missing/circular includes, ABI/ODR violations, CMake configuration errors |
| `references/embedded.md` | Flash/RAM overflow, board package/library version conflicts, PSRAM and partition scheme errors, upload/port failures, missing board definitions |
