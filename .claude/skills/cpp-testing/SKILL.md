---
name: cpp-testing
description: Set up or write unit tests for C++ code, covering both desktop C++ (GoogleTest/Catch2 with CMake/CTest) and embedded/Arduino C++ (host-compiled tests for hardware-independent logic, PlatformIO native environments, Unity for on-device tests). Use this whenever the user asks to write tests, add test coverage, set up a test framework, test a C++ function/class in isolation, or asks how to test code that normally depends on hardware (sensors, displays, BLE) without the physical device.
---

# C++ Testing

Two different testing problems hide under "C++ testing":

1. **Desktop/server C++**: the whole program can run on the test machine, so you test more or less anything directly.
2. **Embedded/Arduino C++**: most of the program depends on hardware (SPI sensors, BLE radios, displays) that doesn't exist on your laptop. You can't run the real firmware in a test runner — the test strategy has to work around that.

Identify which one applies the same way as in `cpp-coding-standards` (Arduino/ESP32/microcontroller signals → embedded; CMake targeting Linux/macOS/Windows → desktop), then read the matching reference.

## How to use this skill

1. Identify desktop vs. embedded.
2. Read the matching reference file before writing any test code.
3. For embedded code, the single most important step is usually **before** writing the test: check whether the logic under test is already separated from hardware calls. If it isn't, the first deliverable may be extracting the pure logic into a hardware-free header/function, *then* testing that — say so explicitly rather than trying to mock `Serial`/`SPI` directly.
4. Write tests that assert behavior (inputs → outputs, state transitions), not implementation details, so they survive refactors.

## Quick index

| Reference | Covers |
|---|---|
| `references/desktop.md` | GoogleTest/Catch2 setup, CMake/CTest integration, fixtures, mocking interfaces, test organization |
| `references/embedded.md` | Separating pure logic from hardware I/O, host-compiled tests for that logic (plain g++, no Arduino.h), PlatformIO `native` test environment, Unity for on-device tests, what's realistic to test at all on this kind of project |
