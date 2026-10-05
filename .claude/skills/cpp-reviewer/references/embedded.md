# C++ Review Checklist — Embedded / Arduino / ESP32

## Blocking in `loop()` or callbacks

- Any `delay()` outside of a genuinely one-shot setup path — it stalls BLE advertising/notifications, WiFi, and UI/touch responsiveness for its whole duration. Check whether it should be a `millis()`-based non-blocking timer instead.
- A blocking network call (`HTTPClient` without a short per-attempt timeout) inside the main loop without a state machine around it — this can hang the whole device, not just that one feature, if the network is unreachable.
- Long-running work inside a BLE/interrupt callback (`onConnect`, `onResult`, a notify callback) — callbacks should set a flag or copy data and return quickly; do the real work in `loop()`.

## Shared state between interrupt/callback context and main context

- A variable written from an ISR or BLE callback and read in `loop()` (or vice versa) that isn't `volatile` — the compiler may cache a stale value in a register and the main loop will never observe the change.
- A multi-byte or multi-field value (a struct, a `long`) updated non-atomically from a callback while `loop()` reads it — on a 32-bit core a single aligned 32-bit write is atomic, but a struct or a 64-bit value isn't; check whether a torn read is possible.
- Re-entrancy: does the callback get called again (another BLE event, another interrupt) while the previous invocation's data is still being consumed by `loop()`?

## Memory

- `String` concatenation inside `loop()` or any frequently-called path — each concatenation reallocates on the heap; over long uptimes this fragments the heap until an allocation fails even with "enough" free memory reported. Flag it even if it works fine in short testing.
- Fixed-size buffers (`char buf[N]`) written via `strcpy`/raw indexing without a bounds check against `N` — a barcode scanner, QR payload, or network response that's longer than expected will overflow the buffer.
- Stack usage in deeply nested calls or large local arrays/structs on the stack inside a function called from a callback — callback stacks on some frameworks are smaller than the main task stack.

## Hardware/timing correctness

- `millis()` rollover: `millis() - lastMs > interval` is correct even across the ~49-day rollover (unsigned arithmetic wraps correctly) — but `if (millis() > lastMs + interval)` is NOT, flag that pattern specifically.
- A sensor/peripheral read used before confirming the device initialized successfully (no check on `begin()`'s return value, or no check that a calibration/configuration step actually completed before trusting its output).
- GPIO configured as `INPUT`/`OUTPUT` but never set to a safe initial state before the first read/write, or a pull-up/pull-down assumption that isn't verified against the actual wiring.
- Deep sleep / wake configuration: wake source (`esp_sleep_enable_ext0_wakeup` or similar) not matching what's actually wired, or RTC GPIO state not released (`rtc_gpio_deinit`) after waking, which can leave a pin stuck.

## Debounce and input handling

- A button/switch read without debounce (a single `digitalRead` triggering an action) — mechanical bounce can fire the handler multiple times for one physical press. Edge-detection (`previous == HIGH && current == LOW`) is the minimum; a time-based debounce is more robust for noisy inputs.

## Power and persistence

- A value that should survive a reset/power-loss (calibration factor, WiFi credentials, a counter) kept only in RAM instead of NVS/Preferences/EEPROM.
- Writing to NVS/flash on every `loop()` iteration instead of only when the value actually changes — flash has a limited write-cycle lifetime.

## What NOT to flag as a bug

- `new` without a matching `delete` for an object meant to live for the whole program (a callback object, a driver instance) — this is a normal "forever" allocation on this kind of device, not a leak.
- A `static` instance pointer used to bridge a C-callback API back to a C++ object — a legitimate, minimal pattern here.
- Prefixed enum names (`ESTADO_SCAN`) in an existing plain `enum` — flag it as a style improvement (see `cpp-coding-standards`), not as a bug.
