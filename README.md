# Calculator — Tauri + Vanilla JS + Web Components

Stack: **Tauri v2** · **Bun** · **Vanilla TypeScript** · **Web Components** · **Open Props**

## Prerequisites

```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Install Bun
curl -fsSL https://bun.sh/install | bash

# 3. Install system deps (Linux only)
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev

# Windows/macOS: no extra deps needed
```

## Setup

```bash
# Install dependencies
bun install

# Dev mode (hot reload)
bun tauri dev

# Build production binary
bun tauri build
```

## Project Structure

```
src/
├── main.ts                  Entry point — registers Web Components
├── components/
│   ├── calc-app.ts          Root shell component
│   ├── calc-display.ts      Display (subscribes to state)
│   ├── calc-button.ts       Single button + event dispatch
│   ├── calc-grid.ts         Button layout + keyboard handler
│   └── calc-history.ts      Calculation history panel
├── core/
│   ├── state.ts             Vanilla state (pub/sub, no library)
│   └── engine.ts            Calc logic + Tauri IPC bridge
└── styles/
    └── app.css              Open Props + calculator theme

src-tauri/src/
├── main.rs                  Tauri entry point
└── commands.rs              Rust calc engine (recursive descent parser)
```

## Architecture

```
┌─────────────────────────────────────┐
│  Web Components (Vanilla TS)        │
│  calc-app > calc-display            │
│           > calc-grid > calc-button │
│           > calc-history            │
├─────────────────────────────────────┤
│  State (pub/sub, zero deps)         │
│  Engine (Tauri IPC / JS fallback)   │
├─────────────────────────────────────┤
│  Tauri v2 (Rust)                    │
│  commands::calculate                │
│  → Recursive descent parser        │
└─────────────────────────────────────┘
```

## Extending

### Add new Rust command
```rust
// src-tauri/src/commands.rs
#[tauri::command]
pub fn my_command(input: String) -> Result<String, String> {
    Ok(format!("Hello {}", input))
}

// src-tauri/src/main.rs — register it
.invoke_handler(tauri::generate_handler![
    commands::calculate,
    commands::my_command,  // add here
])
```

### Call from TypeScript
```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke<string>("my_command", { input: "world" });
```

## Build Output
- Windows: `.msi` + `.exe` (~3-5MB)
- macOS: `.dmg` + `.app`
- Linux: `.deb` + `.AppImage`
