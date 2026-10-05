# C++ Testing — Embedded / Arduino / ESP32

## The core problem: most firmware can't run on your laptop

You can't instantiate a `BLEServer` or read a real PMW3901 sensor on your development machine. There are two realistic strategies, and they're complementary rather than alternatives:

1. **Pull the hardware-independent logic out into plain C++ and test *that* on the host** — this covers the majority of bugs (bad math, wrong state transitions, off-by-ones) without needing any hardware or simulator.
2. **Test the hardware-dependent glue on the real device**, usually manually or with a much smaller on-device test framework, because that's the only place it can actually run.

Most of the value is in (1). Don't try to mock `Serial`, `SPI`, or `BLEDevice` to unit-test code that's entangled with them — it's a lot of effort for brittle tests. Instead, **restructure the code so the logic doesn't depend on them in the first place**, then test the restructured logic.

## Pattern: extract pure logic into a hardware-free header

If you see a calculation, validation, or state-transition function mixed into a `.ino` or a class that also calls `Serial.println`, `digitalWrite`, etc., the fix is usually to split it:

```cpp
// calibration_calc.h — no Arduino.h, no hardware calls, compiles with plain g++
#ifndef CALIBRATION_CALC_H
#define CALIBRATION_CALC_H

inline float calibrationFactor(const long* counts, int n) {
    if (n <= 0) return 0.0f;
    long sum = 0;
    for (int i = 0; i < n; i++) sum += counts[i] < 0 ? -counts[i] : counts[i];
    long avg = sum / n;
    return avg > 0 ? 100.0f / static_cast<float>(avg) : 0.0f;
}

#endif
```

This header has zero Arduino dependencies, so it compiles and runs with a plain host compiler — no board, no simulator, no mocking needed. The `.ino`/`.cpp` that actually talks to hardware just calls this function and handles the result.

If the project already has files like this (pure `.h` headers with `static inline` math/logic functions, no `#include <Arduino.h>`), that's exactly the pattern to continue — keep adding to those rather than embedding more logic directly into hardware-touching classes.

## Host-compiled tests (plain g++, no board needed)

The simplest setup: a small `test/` directory with files that `#include` the pure-logic header and a minimal hand-rolled assertion scheme, or a lightweight header-only framework (e.g. `doctest`, which is a single header and has no platform dependencies):

```cpp
// test/test_calibration.cpp
#include "../calibration_calc.h"
#include <cassert>
#include <cstdio>

int main() {
    long counts[] = {4250, 4300, 4200};
    float factor = calibrationFactor(counts, 3);
    assert(factor > 0.0f && factor < 1.0f);

    long zeros[] = {0, 0, 0};
    assert(calibrationFactor(zeros, 3) == 0.0f);

    printf("All tests passed\n");
    return 0;
}
```

Compile and run directly, no Arduino toolchain involved: `g++ -std=c++17 test/test_calibration.cpp -o test_calibration && ./test_calibration`

## PlatformIO `native` environment (if the project uses PlatformIO)

PlatformIO supports a `native` environment that compiles and runs tests on the host machine instead of a board, using the same project structure:

```ini
; platformio.ini
[env:native]
platform = native
test_framework = unity
build_flags = -std=c++17
```

```
pio test -e native
```

This only works for code that doesn't `#include <Arduino.h>` or call board-specific APIs — same constraint as above, it's the mechanism, not a way around the constraint.

## On-device tests (when you genuinely need the real hardware)

For code that can't be separated from hardware (actually reading the SPI sensor, actually connecting BLE) — use **Unity** (the C testing framework bundled with PlatformIO, unrelated to the Unity game engine) running on the board itself, and keep these tests few and focused on "does the hardware respond at all" rather than exhaustive logic coverage (that belongs in the host tests above).

```cpp
#include <unity.h>

void test_sensor_responds() {
    TEST_ASSERT_TRUE(sensor.begin());
}

void setup() {
    UNITY_BEGIN();
    RUN_TEST(test_sensor_responds);
    UNITY_END();
}
void loop() {}
```

## What's realistic to cover

- **Always test on host**: pure calculations (calibration factors, unit conversions), parsers (QR/text parsing), state-machine transition logic, validation rules.
- **Usually not worth testing automatically**: BLE connection handling, display rendering, timing-sensitive sensor reads — verify these manually against the real hardware, and keep the amount of logic entangled with them as small as possible so there's less of this category to begin with.
