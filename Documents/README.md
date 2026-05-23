# Documentation Index – StonkSchool MVP

This folder contains the **authoritative documentation** for the StonkSchool MVP.

These documents define:
- Product intent
- Feature boundaries
- System behavior
- Technical constraints

⚠️ **All code MUST strictly follow these documents.**  
If code conflicts with docs, **the docs win**.

---

## How to Read These Docs (Order Matters)

Start here, in this exact order:

1. **MVP_Vision.md**
   - What the product is
   - Who it is for
   - What problem it solves
   - What it is NOT

2. **Feature_Requirements_Document_(FRD).md**
   - What features exist in the MVP
   - What is explicitly excluded
   - Priority (P0 / P1 / P2)

3. **User_flow.md**
   - End-to-end user journey
   - Screen transitions
   - Expected user behavior

4. **Component_Architecture_Document.md**
   - Backend and frontend components
   - Responsibilities of each service
   - Communication patterns

5. **State_Machine_Diagram_Description.md**
   - Contest lifecycle states
   - Valid and invalid transitions
   - Deterministic execution rules

6. **Sequence_Diagram_Descriptions.md**
   - Runtime behavior
   - API call order
   - Transaction boundaries

7. **Database_Design_Document.md**
   - Tables
   - Relationships
   - Constraints
   - Indexing strategy

8. **API_Specification_Document.md**
   - REST endpoints
   - Request/response contracts
   - Error codes

9. **DevOps_&_Deployment_Document.md**
   - CI/CD
   - Environments
   - Deployment strategy

---

## Non-Negotiable Product Rules (Read Before Coding)

- This is a **fantasy trading + education platform**
- **No real money trading**
- **No broker integrations (Zerodha, etc.)**
- **No live order book**
- Contests use **pre-commit allocation**
- Allocations are **locked before contest start**
- Portfolio computation must be **deterministic**
- Same market data is used for **all participants**
- Virtual wallet only (coins)

---

## Coding Guidelines (Important)

When implementing any feature:

1. Identify the feature in **FRD**
2. Confirm user flow in **User_flow.md**
3. Follow component boundaries in **Component_Architecture**
4. Enforce lifecycle rules from **State_Machine**
5. Match API contracts exactly
6. Ensure database constraints are respected

---

## For AI / Copilot Context

If you are generating code using AI tools:

- Assume these docs are already read
- Do NOT invent features
- Do NOT add integrations not mentioned here
- Do NOT change contest mechanics
- If something is unclear → follow existing patterns in docs

---

## Source of Truth

If two documents appear to conflict:
1. MVP_Vision.md wins
2. FRD wins over technical docs
3. Architecture wins over implementation

---

End of documentation index.
