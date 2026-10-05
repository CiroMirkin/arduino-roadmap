# C++ Testing — Desktop/Server

## Framework choice

- **GoogleTest**: the default choice for most new projects — widest ecosystem, built-in mocking (`gmock`), good CMake integration via `FetchContent`.
- **Catch2**: lighter-weight, single-header option, nicer assertion syntax (`REQUIRE(x == y)` without a separate `EXPECT_EQ`), good when you want fewer dependencies.
- Match whatever the project already uses rather than introducing a second framework.

## CMake/CTest wiring

```cmake
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip
)
FetchContent_MakeAvailable(googletest)

enable_testing()
add_executable(unit_tests test/widget_test.cpp)
target_link_libraries(unit_tests GTest::gtest_main mylib)
include(GoogleTest)
gtest_discover_tests(unit_tests)
```

Run with `ctest --output-on-failure` so CI gets readable failures, not just pass/fail counts.

## Structure

- One test file per class/module under test (`widget_test.cpp` for `widget.cpp`), mirroring the source tree under `test/`.
- Use fixtures (`TEST_F` in GoogleTest) when several tests share setup/teardown (e.g. constructing the same object under test); plain `TEST` for isolated cases.
- Name tests by behavior, not implementation: `ParsesEmptyStringAsNoValue`, not `TestParse1`.

## Mocking

- Mock at interface boundaries (abstract base classes, or a thin wrapper you own around a third-party library) — don't try to mock concrete classes you don't control.
- `gmock` (`MOCK_METHOD`) for GoogleTest; for Catch2, hand-roll simple test doubles or pull in a separate mocking library.
- Prefer dependency injection (pass the dependency in, usually as a reference or interface pointer) over compile-time `#ifdef TESTING` switches — it keeps the production code path identical to what ships.

## What to test

- Public behavior and edge cases (empty input, boundary values, error paths) over internal implementation details.
- Exception safety: that a failed operation leaves the object in a valid state, that resources are released even when an exception is thrown partway through.
- Concurrency-sensitive code with stress tests or sanitizer-backed runs (TSan) rather than relying on test flakiness to "prove" a race exists.

## Example

```cpp
#include <gtest/gtest.h>
#include "widget.h"

TEST(WidgetTest, ConstructsWithGivenSize) {
    Widget w(42);
    EXPECT_EQ(w.size(), 42);
}

TEST(WidgetTest, RejectsNegativeSize) {
    EXPECT_THROW(Widget(-1), std::invalid_argument);
}
```
