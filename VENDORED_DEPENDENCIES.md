# Vendored Dependencies - zerodha-ss

## Overview

The `zerodha-ss` library has been **vendored** (copied into) the stonkschool repository to make it **self-contained and independent**.

## Why Vendored?

Previously, the backend had an external path dependency:
```toml
zerodha-tl = { path = "../../zerodha-ss" }  ❌ Points outside!
```

**Problem:** If you clone `stonkschool` alone, the build would fail because `zerodha-ss` wasn't included.

**Solution:** Copy `zerodha-ss` into the stonkschool directory structure:
```
stonkschool/
  ├── backend/          (Rust backend)
  ├── zerodha-ss/       (Market data library - VENDORED)
  ├── Documents/        (Specifications)
  └── README.md
```

Now the dependency is:
```toml
zerodha-tl = { path = "../zerodha-ss" }  ✅ Inside project!
```

## What This Means

### ✅ Benefits:
1. **Self-Contained:** Clone `stonkschool` → everything works
2. **No External Dependencies:** All code in one repository
3. **Version Control:** zerodha-ss changes are tracked with the project
4. **Deployment Ready:** Can build anywhere without setup
5. **Git Friendly:** Single repo to manage

### 📦 What's Included:
- `zerodha-ss/src/lib.rs` - Main KiteConnect client
- `zerodha-ss/src/config.rs` - Stream configuration
- `zerodha-ss/src/models.rs` - Tick and Mode types
- `zerodha-ss/src/utils.rs` - Binary parsing logic
- `zerodha-ss/Cargo.toml` - Dependencies
- `zerodha-ss/README.md` - Original documentation

### 🚫 What's Excluded (via .gitignore):
- `zerodha-ss/target/` - Build artifacts (regenerated)
- `zerodha-ss/Cargo.lock` - Dependency lock (backend controls versions)
- `zerodha-ss/.git/` - Git history (not copied)

## Usage in Backend

The backend uses zerodha-ss exactly as before:

```rust
// src/services/market_data_ingester.rs
use zerodha_tl::{KiteConnect, StreamConfig, Mode, Tick};

let kite = KiteConnect::new(api_key, access_token);
let config = StreamConfig::new(instruments).mode(Mode::Full);
let mut stream = kite.stream(config).await?;

while let Some(tick) = stream.next().await {
    // Process market data tick
}
```

No code changes needed - just the Cargo.toml path updated!

## Git Workflow

### Committing Changes:
```bash
# Everything in stonkschool/ gets committed
git add stonkschool/
git commit -m "Add feature"
git push
```

### Cloning Fresh:
```bash
# Clone the repo
git clone <repo-url> stonkschool
cd stonkschool/backend

# Build immediately - no extra setup!
cargo build
```

### Updating zerodha-ss:
If the original zerodha-ss library gets updates:

```bash
# Option 1: Manual copy
cd H:/Projects/Newprojects
cp -r zerodha-ss/src/* stonkschool/zerodha-ss/src/

# Option 2: Replace entirely
rm -rf stonkschool/zerodha-ss
cp -r zerodha-ss stonkschool/zerodha-ss
rm -rf stonkschool/zerodha-ss/.git

# Then commit
git add stonkschool/zerodha-ss
git commit -m "Update vendored zerodha-ss"
```

## Directory Structure

```
stonkschool/
├── .gitignore                    # Excludes build artifacts
├── README.md                     # Main project docs
├── QUICK_REFERENCE.md
├── HOW_IT_WORKS.md
├── VERIFICATION_REPORT.md
├── NEXT_STEPS.md
│
├── backend/                      # Rust backend
│   ├── Cargo.toml                # ✅ References ../zerodha-ss
│   ├── src/
│   │   ├── main.rs
│   │   ├── services/
│   │   │   └── market_data_ingester.rs  # ✅ Uses zerodha-tl
│   │   └── ...
│   └── migrations/
│
├── zerodha-ss/                   # ✅ VENDORED LIBRARY
│   ├── Cargo.toml                # Library manifest
│   ├── src/
│   │   ├── lib.rs                # KiteConnect client
│   │   ├── config.rs             # StreamConfig
│   │   ├── models.rs             # Tick, Mode
│   │   └── utils.rs              # Binary parsing
│   ├── examples/
│   │   └── try.rs
│   └── README.md
│
└── Documents/                    # Specifications
    ├── README.md
    ├── MVP_Vision.md
    ├── FRD.md
    └── ...
```

## Build Instructions

### Prerequisites:
- Rust 1.85+ installed
- Visual Studio Build Tools (Windows) or gcc (Linux/Mac)
- PostgreSQL 14+

### Build Steps:
```bash
# 1. Clone repository
git clone <your-repo-url> stonkschool
cd stonkschool/backend

# 2. Install dependencies (automatic)
cargo build

# 3. Run
cargo run
```

That's it! No external dependencies to set up.

## Maintenance

### When to Update zerodha-ss:
- When Zerodha changes their API
- When binary packet format changes
- When adding new features (e.g., order placement)
- When fixing bugs

### How to Maintain:
1. Make changes in `stonkschool/zerodha-ss/src/`
2. Test: `cd backend && cargo test`
3. Commit: `git add zerodha-ss/ && git commit`
4. Push: `git push`

### Version Control:
The vendored zerodha-ss doesn't have its own version number. It's versioned as part of stonkschool:
- stonkschool v0.1.0 includes zerodha-ss (current)
- stonkschool v0.2.0 includes zerodha-ss (with updates)
- etc.

## Alternative Approaches (Not Used)

### Why not use crates.io?
- zerodha-ss isn't published to crates.io
- Would require publishing and maintaining separately
- Adds external dependency management complexity

### Why not git submodules?
- Requires extra setup: `git submodule update --init`
- Complicates cloning and deployment
- Team members need to understand submodules

### Why not workspace?
- Doesn't solve the "outside repo" problem
- Still requires zerodha-ss to be present
- Vendoring is simpler for this use case

## Conclusion

**Vendoring zerodha-ss makes stonkschool fully self-contained.**

✅ Clone once → Build immediately → Deploy anywhere

No external dependencies. No setup scripts. Just works.

---

**Last Updated:** January 8, 2026  
**Vendored Version:** zerodha-ss (current as of Jan 2026)
