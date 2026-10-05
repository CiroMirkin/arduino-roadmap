---
name: cpp-reviewer
description: Review C++ code for correctness, safety, and maintainability issues — not just style. Use this whenever the user asks to review C++ code, check it for bugs or vulnerabilities, do a code review before a commit/PR, or asks "what's wrong with this" about C++/Arduino/ESP32 code. Covers both desktop/server C++ (memory safety, exception safety, thread safety, undefined behavior) and embedded/Arduino C++ (ISR safety, blocking calls, memory fragmentation, hardware timing). This goes deeper than cpp-coding-standards — it's for finding actual bugs and risks, not just style nits.
---

# C++ Reviewer

A style checklist (see `cpp-coding-standards`) catches "this isn't idiomatic." This skill is about catching things that are actually broken, dangerous, or likely to fail under conditions the author didn't test — the kind of finding you'd want flagged before merging, not just before a style pass.

As with the other C++ skills here, identify desktop vs. embedded first (Arduino/ESP32/microcontroller signals → embedded; CMake + full OS target → desktop) and read the matching reference — the risk categories that actually matter are different in each world (data races and exception safety for desktop; ISR safety and blocking calls for embedded).

## How to review

1. Identify desktop vs. embedded, read the matching reference checklist.
2. Read the code with the checklist in mind, but don't mechanically apply every item to every line — flag what's actually present and relevant.
3. For each finding, state: what's wrong, *why it matters* (what actually breaks and under what condition), and a concrete fix — not just "this is bad practice."
4. Separate findings by severity in your response: things that will cause bugs/crashes/security issues vs. things that are fine but could be cleaner (point those at `cpp-coding-standards` instead of mixing them in).
5. If the code is fine, say so — don't invent findings to seem thorough.

## Quick index

| Reference | Covers |
|---|---|
| `references/desktop.md` | Memory safety (use-after-free, double-free, dangling references), exception safety, data races/thread safety, undefined behavior, resource leaks, API misuse |
| `references/embedded.md` | ISR/callback safety, blocking calls in `loop()`, shared-state races between interrupt and main context, stack overflow risk, buffer overruns, integer overflow in timing math, uninitialized hardware state |
