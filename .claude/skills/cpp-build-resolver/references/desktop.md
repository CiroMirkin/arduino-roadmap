# C++ Build Resolver — Desktop/Server

## "undefined reference to `Foo::bar()`" (linker error)

The compiler succeeded (it found the declaration); the **linker** can't find the implementation. Common causes, in order of likelihood:

- The `.cpp` with the implementation isn't being compiled/linked at all — check it's actually added to the CMake target (`add_executable`/`add_library` sources) or the Makefile.
- A template function/class is implemented in a `.cpp` instead of the header — templates must be visible (defined, not just declared) at every point of instantiation, which usually means the implementation needs to live in the header, or you need explicit instantiation for each type used.
- Signature mismatch between declaration and definition (parameter types, `const`-ness, namespace) — the linker treats these as different symbols entirely.
- Missing `extern "C"` when linking against a C library from C++, or missing it on the C side when a C++ translation unit's symbol needs C linkage.
- A static library listed in the wrong order relative to what depends on it (matters with traditional linkers that process libraries left-to-right once; modern CMake with `target_link_libraries` mostly sidesteps this, but raw `g++`/`ld` invocations can still hit it).

## "undefined reference to vtable for `Foo`"

Usually means a pure virtual function was declared but never given a definition when one was needed (even `= 0` pure virtuals sometimes need a definition if called via base-class destructor), or the class has a virtual function declared but not defined anywhere, and no translation unit "anchors" the vtable.

## Template instantiation errors (walls of text)

- Read the **innermost** error first — the outer frames are usually just "while instantiating X" context, and the actual problem (a missing operator, a type that doesn't satisfy a constraint) is at the bottom.
- If using concepts (C++20), the constraint-failure message is usually much clearer than pre-concepts SFINAE errors — if available, suggest migrating a hand-rolled `enable_if` constraint to a `concept` for better diagnostics going forward.
- A common root cause: passing a type that doesn't support an operation the template needs (e.g. `std::sort` on a type without `operator<`) — check what the template actually requires against what the type provides.

## Include/circular dependency errors

- "incomplete type" errors on a forward-declared class usually mean code is trying to use the type (call a method, access a member) where only a forward declaration is visible — the full header needs to be included at that point, or the usage needs to move to the `.cpp`.
- Circular includes between two headers that `#include` each other: break the cycle with a forward declaration in one of them plus the real include in the `.cpp`.

## ODR (One Definition Rule) violations

- The same symbol defined differently in different translation units (common with `inline` functions that aren't actually identical, or a non-`inline` function/variable defined in a header included by multiple `.cpp` files) — causes link errors or, worse, silent undefined behavior if the linker picks one definition arbitrarily. Mark header-defined non-template functions `inline`, or move the definition to a single `.cpp`.

## CMake configuration errors

- "Could not find package X": check the package is actually installed/discoverable (`find_package` search paths, `CMAKE_PREFIX_PATH`), or switch to `FetchContent` to pull it as source.
- Stale `build/` directory after a CMakeLists.txt change that alters the generator or cache variables — suggest deleting and regenerating `build/` before debugging further, since half the "weird" CMake errors are actually stale cache state.

## Environment checklist

Before deep-diving a confusing error, confirm: compiler version matches what the project expects (C++ standard flag, `-std=c++20` etc.), the build directory isn't mixing object files from a previous compiler/flag combination, and (for cross-platform issues) whether the error is OS/compiler-specific (MSVC vs GCC vs Clang often diverge on edge-case template errors).
