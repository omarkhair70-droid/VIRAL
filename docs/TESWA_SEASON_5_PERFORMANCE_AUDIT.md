# TESWA Season 5 Performance Audit (Phase 51)

## 1) Season 5 performance baseline

Season 4 substantially improved product feel, visual quality, and conversion polish. After that UI quality step-up, speed and perceived responsiveness are the next bottleneck for premium feel.

Post-Season-4 screen-recording review shows route transitions and loading states are still visible often enough to make the app feel heavier than the visual system now suggests.

Phase 51 therefore focuses on low-risk wins that reduce unnecessary server work and shorten time-to-useful-content without changing behavior.

## 2) Phase 51 concrete fixes implemented

### A. Shared shell duplicate work reduction

- Introduced a request-local helper that centralizes shell auth + unread counts.
- Header and mobile bottom nav now consume the same per-request result instead of each performing overlapping queries independently.
- This removes duplicate same-request calls for:
  - auth.getUser
  - unread deal messages RPC
- Freshness semantics are preserved because memoization is request-local only.

### B. Home page independent fetch parallelization

- `featured_story_items` count and `creator_drops` published count now execute in parallel with `Promise.all`.
- `showStoryEntry` behavior and all CTA/UI logic remain unchanged.

### C. Item detail independent fetch parallelization

- After the main item query completes, “more from owner” and owner review aggregation queries now execute in parallel.
- Trust badge logic, “more from owner” rendering, and notFound/auth checks are unchanged.

## 3) Code-level hotspot inventory for later phases

Documented hotspots intentionally deferred beyond Phase 51:

- Heavy authenticated aggregation pages with multiple counts/joins in one request path.
- Dashboard-style pages with broad count fan-out.
- People/profile trust aggregation where review-derived metrics can become expensive under scale.
- Marketplace/category pages with sequential dependency chains that can be flattened or streamed.
- Repeated shell-sensitive counters that may need a dedicated server-side aggregation strategy.

## 4) Candidate next phases

### Phase 52 — Segment Loading, Streaming & Route-Level Perceived Speed

- Introduce route segment loading boundaries and selective streaming for high-latency sections.
- Focus on faster first paint/interaction perception while preserving data correctness.

### Phase 53 — Query Shape, Aggregation & Count Efficiency

- Reduce query fan-out and tighten select/count patterns.
- Evaluate server-side aggregation endpoints where they reduce repeated query overhead safely.

### Phase 54 — Measurement / Web Vitals / Real Performance Monitoring

- Add disciplined measurement and dashboards for Core Web Vitals + server timings.
- Define performance budgets and regression alerts before larger optimization passes.

## 5) Explicit non-goals in Phase 51

- No new cache TTLs.
- No stale-data tradeoffs for user-specific reads.
- No business logic changes.
- No auth/route behavior changes.
- No schema or RPC contract changes.
