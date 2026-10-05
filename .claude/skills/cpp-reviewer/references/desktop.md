# C++ Review Checklist — Desktop/Server

## Memory safety

- **Use-after-free**: a reference/pointer/iterator kept past the lifetime of what it points to (a reference to a local returned from a function, an iterator held across a container resize/erase, a pointer to a moved-from object).
- **Double-free / mismatched new-delete**: raw `new`/`delete` pairs where a path (early return, exception) can skip the `delete`, or `new[]`/`delete` mismatches.
- **Dangling references from lambdas**: a lambda that captures `[&]` and outlives the scope it was created in (stored for later, passed to another thread) — captured references become dangling.

## Exception safety

- A constructor that partially initializes a resource, then throws, without cleaning up what was already acquired — check this is RAII-safe (each resource in its own RAII wrapper, so a partial failure unwinds cleanly).
- Exceptions thrown from a destructor, or from a `noexcept`-marked function (the latter calls `std::terminate`, not a graceful failure).
- A function marked `noexcept` that calls something that can actually throw (string allocation, container operations) — this isn't a lint, it's a latent `std::terminate`.

## Concurrency

- Shared mutable state accessed from multiple threads without a lock or atomic — look for member variables touched both inside and outside a locked section.
- Lock ordering: two or more mutexes locked in inconsistent order across different code paths → deadlock risk.
- `std::shared_ptr` reference counting is thread-safe, but the *pointed-to object* is not automatically thread-safe just because it's behind a `shared_ptr`.

## Undefined behavior

- Signed integer overflow (UB in C++, unlike unsigned wraparound which is well-defined).
- Out-of-bounds access via `[]` on `std::vector`/`std::array` (use `.at()` when bounds aren't already guaranteed, or add an explicit check).
- Reading an uninitialized variable, especially a member not covered by a member-initializer list or the constructor body.
- Type-punning via `reinterpret_cast` or union aliasing that violates strict aliasing — prefer `memcpy` or `std::bit_cast` (C++20) for safe reinterpretation.

## API misuse / logic bugs

- Off-by-one in loop bounds, especially with `<=` vs `<` against a `.size()` that returns an unsigned type (comparing signed and unsigned can produce surprising results).
- A function that takes ownership (by value, or by `unique_ptr`) being called with something the caller still needs afterward.
- Comparing floating-point values with `==` instead of a tolerance-based comparison.

## What NOT to flag as a bug

- Intentional raw pointers for non-owning views/parameters — that's correct usage, not a smart-pointer omission.
- A `TODO` or a known-scoped simplification the author has clearly left a comment about — note it, don't present it as a surprise finding.
