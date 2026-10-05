# C++ Coding Standards — Desktop/Server

Context: Linux/macOS/Windows targets, CMake or similar build system, full STL available, exceptions enabled, dynamic allocation is cheap and expected. Based on the spirit of the C++ Core Guidelines (Stroustrup/Sutter), scoped down to what actually matters day to day.

## Memory and ownership

- **No raw owning pointers.** Every `new` needs a clear owner; prefer `std::unique_ptr` by default, `std::shared_ptr` only when ownership is genuinely shared (and be able to say who shares it and why). A raw pointer or reference is fine as a *non-owning* view passed into a function.
- **RAII for every resource**, not just memory: file handles, sockets, mutex locks (`std::lock_guard`/`std::unique_lock`), anything with an open/close pair.
- **Rule of 0 or Rule of 5.** If a class manages a resource, define all five special members (destructor, copy ctor/assign, move ctor/assign) or explicitly `= delete` copy and rely on move. If it doesn't manage a resource, define none of them — let the compiler generate everything (Rule of 0).
- Prefer `std::make_unique`/`std::make_shared` over bare `new` — they're exception-safe and avoid naming the type twice.

## Types and correctness

- `const` everything that doesn't change: parameters you don't modify (`const T&` for anything bigger than a pointer), member functions that don't mutate state (`T foo() const`), local variables set once.
- Prefer `enum class` over plain `enum` — it doesn't leak names into the enclosing scope and won't silently convert to `int`.
- Prefer `constexpr` over `#define` for constants — it's typed, scoped, and debuggable. Reserve `#define` for conditional compilation (`#ifdef`) and header guards (or use `#pragma once`, widely supported).
- `static_cast`, `dynamic_cast`, `const_cast`, `reinterpret_cast` instead of C-style casts — each one documents exactly what kind of conversion is intended and is greppable.
- Mark single-argument constructors `explicit` unless you specifically want implicit conversion.

## Templates and generic code

- Prefer `concepts` (C++20) over `enable_if`/SFINAE when constraining templates — the error messages alone are worth it.
- Keep template implementations in headers (or use explicit instantiation if you need to hide them), but keep the *public interface* documented separately from the metaprogramming details if the template internals are hairy.
- Don't reach for templates when overloading or a `std::variant`/`std::function` would be clearer — templates are for genuine type-generic algorithms, not a way to avoid writing two functions.

## STL and algorithms

- Prefer STL algorithms (`std::sort`, `std::find_if`, `std::accumulate`, ranges in C++20) over hand-written loops when they express the intent more clearly. A hand-written loop is fine when the algorithm doesn't fit cleanly.
- Prefer `std::string`/`std::string_view` over C-strings; `std::string_view` for read-only, non-owning string parameters to avoid copies.
- Reach for `std::optional` instead of sentinel values (`-1`, `nullptr`-as-"not found") to represent "no value."

## Error handling

- Exceptions for truly exceptional, unrecoverable-at-this-level errors; return codes or `std::optional`/`std::expected` (C++23) for expected failure modes (file not found, parse error) that the caller is meant to handle.
- Never let an exception escape a destructor.
- `noexcept` on functions that genuinely can't throw (especially move constructors — this matters for STL container performance).

## Naming and structure

- Types: `PascalCase`. Functions and variables: `camelCase` or `snake_case` — pick one per codebase and stay consistent with what's already there rather than imposing a new convention mid-file.
- Separate declaration (`.h`/`.hpp`) from definition (`.cpp`) for anything beyond a trivial one-liner; keep headers free of implementation details that would force recompilation of everyone who includes them.
- One class per file pair when the class is substantial; small, tightly related helper types can share a file.

## Build (CMake)

- Modern CMake (3.14+): target-based (`target_link_libraries`, `target_include_directories`) rather than global `include_directories`/`link_libraries`.
- Treat warnings as errors in CI (`-Wall -Wextra -Werror` or equivalent), with sanitizers (ASan/UBSan) enabled in debug/test builds.
- `include/` for public headers, `src/` for implementation — keeps the public surface obvious.

## Good vs. bad example

```cpp
// Bad: raw owning pointer, C-style cast, mutable-looking signature
Widget* makeWidget(int n) {
    Widget* w = new Widget((float)n);
    return w;
}

// Good: clear ownership, typed cast, const-correct
std::unique_ptr<Widget> makeWidget(int n) {
    return std::make_unique<Widget>(static_cast<float>(n));
}
```
