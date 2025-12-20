# Improvements Checklist

This list is based on a pass over contracts, tests, and the Next.js frontend. It is grouped by area and includes required upgrades: Clarity 4 syntax and Hiro Chainhook client usage.

## Contracts (Clarity 4 + AMM logic)

- [x] Upgrade all contracts to Clarity 4, update `Clarinet.toml` to `clarity_version = 4`, and resolve any syntax changes needed for Clarity 4 checks.
- [x] Replace `use-trait` reference to a public testnet contract with a local trait definition or a project-local trait contract so simnet and deployment are deterministic.
- [x] Add explicit error constants for "pool not found", "invalid fee", and "division by zero" cases instead of `(err u0)` placeholders.
- [x] Guard against division-by-zero in `get-amounts` (when reserves are zero) and `remove-liquidity` (when pool liquidity is zero).
- [x] Prevent underflow in initial liquidity minting by validating `sqrti(amount-0 * amount-1) > MINIMUM_LIQUIDITY` before subtracting `MINIMUM_LIQUIDITY`.
- [x] Validate `fee` bounds (e.g., `fee > 0` and `fee < FEES_DENOM`) in `create-pool`.
- [x] Normalize token ordering inside `add-liquidity`, `remove-liquidity`, and `swap` (or reject non-canonical ordering) so callers cannot target non-existent pools by reversing tokens.
- [x] Add slippage controls to `swap` (minimum output) and optionally to `remove-liquidity` (minimum outputs) to protect users.
- [x] Store a list of pool IDs on-chain (e.g., `data-var` or map index) so pools can be enumerated without relying on events.
- [x] Standardize event payloads for all actions (`create-pool`, `add-liquidity`, `remove-liquidity`, `swap`) so downstream indexers can parse consistently.
- [x] Review fee accounting: consider whether fees should accrue to LPs by keeping them in the pool balances vs. explicit fee tracking, and make the intent explicit.

## Token contract (mock-token)

- [x] Restrict `mint` to a contract owner or a set of minters; current version is permissionless.
- [x] Update `transfer` authorization to allow `contract-caller` as the sender when transfers are initiated by other contracts.
- [x] Add a `set-token-uri` or `get-token-uri` implementation that returns a usable metadata URI (if desired).
- [x] If using multiple mock tokens, split `contracts/mock-token.clar` into separate files and unique token names to avoid confusion in tests/deployment.

## Frontend (Hiro Chainhook client usage required)

- [x] Replace `getAllPools` event scanning via Hiro API with Chainhook client subscriptions for `smart_contract_log` events, so the UI updates in real time.
- [x] Add a Chainhook registration flow (likely in a Next.js API route or a small backend service) to register hooks for:
  - `create-pool` logs (to add new pools),
  - `add-liquidity` / `remove-liquidity` logs (to update balances),
  - `swap` logs (to update pool reserves).
- [x] Persist Chainhook results in a store (SQLite, Redis, or a simple JSON file during dev) and have the frontend read from it instead of scanning events.
- [x] Provide configuration for Chainhook endpoints and contract IDs via env vars (`NEXT_PUBLIC_*`) instead of hard-coded addresses.
- [x] Switch Hiro API calls to `https://` and add basic fetch error handling and retries.
- [x] Fix `PoolListItem` explorer links: use proper explorer URLs for contracts instead of `/txid/` paths.
- [x] Avoid crashing when `pools` is empty: components rely on `pools[0]` without guards.
- [x] Validate numeric inputs to avoid `NaN` when fields are cleared; provide user-friendly error states.
- [x] Update swap estimation to guard against underflow when `fromAmount > pool balance`, and show a clear warning.
- [x] Use bigint-safe math for estimate outputs and display rounding behavior clearly.

## Tests

- [x] Add coverage for error paths: incorrect token ordering, pool not found, zero/negative amounts, invalid fee, and division-by-zero conditions.
- [x] Add swap tests for slippage protection and min-output handling once added.
- [x] Add tests for initial-liquidity underflow protection and edge rounding cases.
- [x] Add tests confirming Chainhook-consumed log payloads are stable (schema snapshot tests).

## Config & Docs

- [x] Expand `README.md` with setup steps, contract deployment, frontend usage, and Chainhook configuration.
- [x] Document environment variables for network, contract IDs, and Chainhook server URLs.
- [x] Add a short "Architecture" section explaining how Chainhook feeds the UI and where data is stored.
