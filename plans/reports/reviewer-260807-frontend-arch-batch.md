# Reviewer Report — Frontend Architecture Batch (2026-08-07)

Scope: P2-8 session-frame, P2-7 generic engine, P1-4 cancelled flags, P2-9 EntityManager update, P2-6 take-test extraction, FE-008 client.test.ts. Read-only code review; build not run (given green). No blocking defects found.

## Verdict per verification point

### 1. take-test timer semantics — PASS (preserved exactly)
`use-take-test.ts` moved timer code verbatim from old `[testId]/page.tsx`:
- `submitRef` synced every render: `useEffect(() => { submitRef.current = submit; }, [submit])` (old == new).
- Deadline `setTimeout` calls `void submitRef.current()` with `clearInterval(t)` first (old == new).
- `setElapsed((s) => s + 1)` — pure updater, zero side effects (old == new).
- Cleanup clears both interval + timeout; deps `[phase, test]` unchanged.
- `duration = elapsed || 1`, `submittingRef` guard, error→phase 'error' — all identical.
- Load effect additionally gained a `cancelled` flag (improvement, no regression).
- `start`/`submit`/`setAnswer`/`setCurrent` wiring in new page equivalent to old.

### 2. Generic engine — PASS (no contract break; one type-level cast added)
- session.tsx/game-session.tsx pass `usePracticeEngine<PracticeModeState>` / `<GameModeState>`; per-mode `engine.modeState as XState | null` casts unchanged in pattern (previously from `unknown`, now from union — same lie, tsc-valid narrowing cast).
- `setModeState: (state: TState) => void` assignable to each mode's `onStateChange: (state: X) => void` (contravariance; X ⊆ TState). Modes only call `onStateChange` inside their wrapped update handlers, not in effect deps — fresh function identity per engine render (elapsed tick) is harmless. tsc 0 confirms.
- Only new cast: `setModeState(saved.modeState as TState)` on session-restore path (practice-engine.ts:68). See F1.

### 3. EntityManager edit — PASS (prefill correct; notes F2-F4)
- `toFormValue`: object→`JSON.stringify`, numbers→`String`, null/undefined→''. Round-trip: `Number("0")=0` handled (string "0" truthy).
- `update` invoked only when defined: Sửa button gated on `config.update`, `startEdit` guards `!config.update`, submit uses `config.update?.(...)`.
- `editingId` reset on every close path: cancel/Hủy, modal X, Escape/backdrop (`Modal onClose={closeForm}`), and save success (closeForm then load).
- Questions page `parseJson` re-parses questionData/answerData/acceptedAnswers on both create+update — round-trip preserved.

### 4. session-frame dedup — PASS (limit/error/finished UX preserved)
- LimitScreen: title/subtitle + Nâng cấp VIP / Quay lại buttons identical to old per-file versions; `kind='chơi'` keeps title "Hết lượt chơi hôm nay". Copy-only diffs: game gains "cho chế độ này"; practice "Lượt mới có vào ngày mai" (was "Lượt sẽ được làm mới vào ngày mai"). No functional change.
- Error branch untouched in both files. SummaryCard markup identical (score%, Đúng/Sai/Thời gian grid, Quay lại). Games previously imported it from session.tsx; both now share session-frame. No circular import (session-frame imports only types + utils).

### 5. Cancelled flags — PASS (loading reset preserved)
All 4 pages (learn/profile/tests-join/resources) guard every setState with `if (!cancelled)`, including `finally { if (!cancelled) setLoading(false) }`. Success/error paths while mounted still reset loading; StrictMode double-invoke handled (first invocation's cleanup cancels; second fetch proceeds). No skipped loading reset.

### 6. client.test.ts — PASS (assertions match client.ts)
All 11 tests verified against client.ts source:
- unwrap envelope ✓; Bearer + Content-Type headers ✓; `auth:false` → no Authorization ✓; ok → returns raw envelope (NOT unwrapped — matches apiFetch comment) ✓; 401+auth → clearAuth + `dispatchEvent('hanzi:unauthorized')` + ApiError(status 401) ✓; 401 public → no clearAuth ✓; string message ✓; array message joined 'a, b' ✓; network reject → ApiError status 0 + Vietnamese message ✓; 204 non-JSON → null ✓; clearAuth removes token+user ✓.
- Window/localStorage stubbed fresh per test (new store in beforeEach) — no leakage. `Event` global works in node env.

## Findings (ranked most-severe first)

- **F1 (Low)** practice-engine.ts:68 `setModeState(saved.modeState as TState)` — persisted-session JSON asserted to `TState` with no runtime shape validation. Pre-existing blind restore (previously `unknown`), now an explicit type-checked lie. Stale/older-format sessionStorage entry would flow into mode components (e.g., restored modeState for a mode whose shape changed across app versions) and surface as runtime misbehavior only when the mode consumes it. Suggest cheap guard: validate/`JSON.parse` in try/catch or reset to null on mismatch. Not a batch regression.
- **F2 (Low)** entity-manager submit uses `config.update?.(editingId, data)` optional chain — if `editingId` set while `update` missing it silently no-ops then `closeForm()`+`load()`, appearing as saved-without-change. Currently unreachable (Sửa button + startEdit both gate on `config.update`); defense-in-depth only.
- **F3 (Low)** select prefill renders blank while async options not loaded (questions page `levelId` if levels fetch slower than list). Cosmetic — form state holds the real id and submits it correctly even if UI shows blank option.
- **F4 (Info)** `toFormValue` JSON.stringifies ANY object field, but submit round-trip only re-parses the page's `parseJson` key list. Any future entity with an object field outside `[questionData, answerData, acceptedAnswers]` would submit a raw JSON string. Latent, no current field affected.
- **F5 (Info)** `use-take-test` returns `submitRef` unused by the page — dead API surface; the ref is internal to the hook, could be removed from return type.
- **F6 (Info)** LimitScreen copy differs slightly from pre-refactor (see point 4) — intentional unification, no UX regression.
- **F7 (Info)** client.test.ts describe-line says "bóc envelope" while the envelope test asserts raw (un-unwrapped) body — comment nit only.

## Unresolved questions

- None blocking. Out-of-scope note: modes pass full state to `onStateChange` (persistState saves it wholesale) — if any mode ever emits a partial state, sessionStorage would persist a partial snapshot. Pre-existing, not part of this batch.
- No runtime/build execution performed per instructions; all findings are static.
