# Improvements Checklist

This list is based on a pass over contracts, tests, and the Next.js frontend. It is grouped by area and includes required upgrades: Clarity 4 syntax and Hiro Chainhook client usage.

## Contracts (Clarity 4 + AMM logic)

- Upgrade all contracts to Clarity 4, update `Clarinet.toml` to `clarity_version = 4`, and resolve any syntax changes needed for Clarity 4 checks.
- Replace `use-trait` reference to a public testnet contract with a local trait definition or a project-local trait contract so simnet and deployment are deterministic.
- Add explicit error constants for "pool not found", "invalid fee", and "division by zero" cases instead of `(err u0)` placeholders.
- Guard against division-by-zero in `get-amounts` (when reserves are zero) and `remove-liquidity` (when pool liquidity is zero).
- Prevent underflow in initial liquidity minting by validating `sqrti(amount-0 * amount-1) > MINIMUM_LIQUIDITY` before subtracting `MINIMUM_LIQUIDITY`.
- Validate `fee` bounds (e.g., `fee > 0` and `fee < FEES_DENOM`) in `create-pool`.
- Normalize token ordering inside `add-liquidity`, `remove-liquidity`, and `swap` (or reject non-canonical ordering) so callers cannot target non-existent pools by reversing tokens.
- Add slippage controls to `swap` (minimum output) and optionally to `remove-liquidity` (minimum outputs) to protect users.
- Store a list of pool IDs on-chain (e.g., `data-var` or map index) so pools can be enumerated without relying on events.
- Standardize event payloads for all actions (`create-pool`, `add-liquidity`, `remove-liquidity`, `swap`) so downstream indexers can parse consistently.
- Review fee accounting: consider whether fees should accrue to LPs by keeping them in the pool balances vs. explicit fee tracking, and make the intent explicit.

## Token contract (mock-token)

- Restrict `mint` to a contract owner or a set of minters; current version is permissionless.
- Update `transfer` authorization to allow `contract-caller` as the sender when transfers are initiated by other contracts.
- Add a `set-token-uri` or `get-token-uri` implementation that returns a usable metadata URI (if desired).
- If using multiple mock tokens, split `contracts/mock-token.clar` into separate files and unique token names to avoid confusion in tests/deployment.

## Frontend (Hiro Chainhook client usage required)

- Replace `getAllPools` event scanning via Hiro API with Chainhook client subscriptions for `smart_contract_log` events, so the UI updates in real time.
- Add a Chainhook registration flow (likely in a Next.js API route or a small backend service) to register hooks for:
  - `create-pool` logs (to add new pools),
  - `add-liquidity` / `remove-liquidity` logs (to update balances),
  - `swap` logs (to update pool reserves).
- Persist Chainhook results in a store (SQLite, Redis, or a simple JSON file during dev) and have the frontend read from it instead of scanning events.
- Provide configuration for Chainhook endpoints and contract IDs via env vars (`NEXT_PUBLIC_*`) instead of hard-coded addresses.
- Switch Hiro API calls to `https://` and add basic fetch error handling and retries.
- Fix `PoolListItem` explorer links: use proper explorer URLs for contracts instead of `/txid/` paths.
- Avoid crashing when `pools` is empty: components rely on `pools[0]` without guards.
- Validate numeric inputs to avoid `NaN` when fields are cleared; provide user-friendly error states.
- Update swap estimation to guard against underflow when `fromAmount > pool balance`, and show a clear warning.
- Use bigint-safe math for estimate outputs and display rounding behavior clearly.

## Tests

- Add coverage for error paths: incorrect token ordering, pool not found, zero/negative amounts, invalid fee, and division-by-zero conditions.
- Add swap tests for slippage protection and min-output handling once added.
- Add tests for initial-liquidity underflow protection and edge rounding cases.
- Add tests confirming Chainhook-consumed log payloads are stable (schema snapshot tests).

## Config & Docs

- Expand `README.md` with setup steps, contract deployment, frontend usage, and Chainhook configuration.
- Document environment variables for network, contract IDs, and Chainhook server URLs.
- Add a short "Architecture" section explaining how Chainhook feeds the UI and where data is stored.
