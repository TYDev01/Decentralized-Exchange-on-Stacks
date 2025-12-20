# Decentralized-Exchange-on-Stacks

## Overview

This project contains a Clarity AMM contract, mock SIP-010 tokens, and a Next.js frontend. It also includes Chainhook integration for contract log indexing.

## Prerequisites

- Node.js 18+
- Clarinet

## Install

```bash
npm install
```

```bash
cd frontend
npm install
```

## Contracts

Check contract syntax:

```bash
clarinet check
```

Generate a deployment plan:

```bash
clarinet deployments generate --testnet --manual-cost
```

Apply a deployment plan:

```bash
clarinet deployments apply --testnet --use-on-disk-deployment-plan --no-dashboard
```

## Frontend

From `frontend/`:

```bash
npm run dev
```

Set contract values:

```bash
NEXT_PUBLIC_AMM_CONTRACT_ADDRESS=STX_ADDRESS
NEXT_PUBLIC_AMM_CONTRACT_NAME=amm
```

## Chainhook

See `frontend/README.md` for Chainhook env vars and endpoints.

## Architecture

- The AMM contract emits structured `print` logs for each action.
- A Chainhook subscription filters `contract_log` events for the AMM contract and forwards payloads to the app.
- The Next.js app stores Chainhook payloads on disk for development and renders summary data in the UI.
