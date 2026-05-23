---

# State Machine Diagrams — MVP

This document defines **formal state machines** for the MVP features that involve **multiple states, transitions, and rules**.
Each section is written so it can be **directly converted into UML / Mermaid / Draw.io diagrams**.

---

# 1. CONTEST LIFECYCLE STATE MACHINE (CORE SYSTEM)

This is the **most critical state machine** in the entire product.

---

## 1.1 Contest States

```
[DRAFT]
[UPCOMING]
[JOINING_OPEN]
[ALLOCATION_LOCKED]
[LIVE]
[ENDED]
[SETTLED]
[CANCELLED]
```

---

## 1.2 State Definitions

### 🟦 DRAFT

* Contest is created by admin
* Not visible to users

**Entry Action**

* Admin creates contest metadata

**Allowed Transitions**

* `publish_contest` → UPCOMING

---

### 🟦 UPCOMING

* Contest is visible
* Countdown to join start

**Entry Action**

* Contest listed publicly

**Allowed Transitions**

* `join_window_opens` → JOINING_OPEN
* `admin_cancel` → CANCELLED

---

### 🟦 JOINING_OPEN

* Users can join contest
* Entry fee accepted

**Entry Action**

* Enable join button
* Wallet debit allowed

**Allowed Transitions**

* `user_joins` → JOINING_OPEN (self-loop)
* `join_window_closes` → ALLOCATION_LOCKED
* `admin_cancel` → CANCELLED

**Invalid Transitions**

* Direct → LIVE
* Direct → ENDED

---

### 🟦 ALLOCATION_LOCKED

* No new joins
* Users must lock allocations

**Entry Action**

* Disable joining
* Enable allocation UI

**Allowed Transitions**

* `user_locks_allocation` → ALLOCATION_LOCKED (self-loop)
* `allocation_deadline_reached` → LIVE
* `admin_cancel` → CANCELLED

**Guards**

* Allocation sum must = 100%

---

### 🟦 LIVE

* Contest actively running
* Market prices flowing
* Leaderboard updating

**Entry Action**

* Start contest engine
* Open WebSocket broadcasts

**Allowed Transitions**

* `contest_time_over` → ENDED
* `admin_force_stop` → ENDED

**Invalid Transitions**

* User join
* Allocation changes

---

### 🟦 ENDED

* Market feed stopped
* Final portfolio values computed

**Entry Action**

* Freeze leaderboard
* Compute rankings

**Allowed Transitions**

* `settlement_complete` → SETTLED

---

### 🟦 SETTLED

* Prizes distributed
* Contest archived

**Entry Action**

* Credit wallets
* Persist final leaderboard

**Allowed Transitions**

* None (terminal state)

---

### 🟥 CANCELLED

* Contest invalidated

**Entry Action**

* Refund entry fees
* Notify users

**Allowed Transitions**

* None (terminal state)

---

## 1.3 Contest State Diagram (Textual UML)

```
[DRAFT]
   |
publish
   v
[UPCOMING]
   |
join_window_opens
   v
[JOINING_OPEN]
   |
join_window_closes
   v
[ALLOCATION_LOCKED]
   |
allocation_deadline
   v
[LIVE]
   |
contest_time_over
   v
[ENDED]
   |
settlement_complete
   v
[SETTLED]

Any State --admin_cancel--> [CANCELLED]
```

---

# 2. USER CONTEST PARTICIPATION STATE MACHINE

This is **per-user per-contest**.

---

## 2.1 States

```
[NOT_JOINED]
[JOINED]
[ALLOCATED]
[ACTIVE]
[COMPLETED]
[REFUNDED]
```

---

## 2.2 State Definitions

### 🟩 NOT_JOINED

* Default state

**Transition**

* `join_contest` → JOINED

---

### 🟩 JOINED

* Entry fee paid
* Virtual capital assigned

**Entry Action**

* Create contest_participant record

**Transition**

* `lock_allocation` → ALLOCATED
* `contest_cancelled` → REFUNDED

---

### 🟩 ALLOCATED

* Allocation locked

**Entry Action**

* Freeze allocations

**Transition**

* `contest_goes_live` → ACTIVE

---

### 🟩 ACTIVE

* Contest running

**Entry Action**

* Track portfolio value

**Transition**

* `contest_ended` → COMPLETED

---

### 🟩 COMPLETED

* Final rank assigned

**Entry Action**

* Display results

---

### 🟩 REFUNDED

* Contest cancelled

**Entry Action**

* Refund wallet

---

## 2.3 Invalid Transitions

* JOINED → ACTIVE (without allocation)
* ACTIVE → ALLOCATED
* COMPLETED → ACTIVE

---

# 3. MARKET REPLAY SESSION STATE MACHINE

---

## 3.1 States

```
[CREATED]
[INITIALIZED]
[RUNNING]
[PAUSED]
[COMPLETED]
[TERMINATED]
```

---

## 3.2 State Definitions

### 🟨 CREATED

* Replay session created

**Transition**

* `initialize_replay` → INITIALIZED

---

### 🟨 INITIALIZED

* Market data loaded
* WebSocket ready

**Transition**

* `start_replay` → RUNNING

---

### 🟨 RUNNING

* Prices streaming
* Trades allowed

**Transitions**

* `pause` → PAUSED
* `replay_end` → COMPLETED
* `user_exit` → TERMINATED

---

### 🟨 PAUSED

* Streaming halted

**Transitions**

* `resume` → RUNNING
* `user_exit` → TERMINATED

---

### 🟨 COMPLETED

* Replay finished naturally

**Entry Action**

* Generate summary

---

### 🟨 TERMINATED

* User exits early

**Entry Action**

* Save progress

---

## 3.3 Replay State Diagram

```
CREATED → INITIALIZED → RUNNING
                     ↘ PAUSED ↗
                        |
                     COMPLETED
                        |
                    TERMINATED
```

---

# 4. WALLET TRANSACTION STATE MACHINE

(Ensures **financial safety & idempotency**)

---

## 4.1 States

```
[INITIATED]
[PENDING]
[SUCCESS]
[FAILED]
[REVERSED]
```

---

## 4.2 State Definitions

### INITIATED

* Transaction created

**Transition**

* `request_payment` → PENDING

---

### PENDING

* Awaiting gateway confirmation

**Transitions**

* `payment_success` → SUCCESS
* `payment_failure` → FAILED

---

### SUCCESS

* Wallet credited/debited

**Entry Action**

* Write ledger entry

---

### FAILED

* No balance change

---

### REVERSED

* Refund issued

**Entry Action**

* Reverse ledger

---

# 5. GLOBAL INVALID TRANSITIONS (SYSTEM-WIDE RULES)

* Allocation changes after `ALLOCATION_LOCKED`
* Wallet mutation without ledger entry
* Contest LIVE without ALLOCATION_LOCKED
* Replay trading outside RUNNING state
* Contest settlement before ENDED

---

# 6. Why These State Machines Matter

* Prevent race conditions
* Enforce fairness
* Enable deterministic debugging
* Make backend logic provably correct
* Perfect for Rust’s strict modeling (enums + match)

---

# 7. Implementation Hint (Rust)

Each state machine maps cleanly to:

```rust
enum ContestState {
    Draft,
    Upcoming,
    JoiningOpen,
    AllocationLocked,
    Live,
    Ended,
    Settled,
    Cancelled,
}
```

With guarded transitions enforced at compile + runtime.
