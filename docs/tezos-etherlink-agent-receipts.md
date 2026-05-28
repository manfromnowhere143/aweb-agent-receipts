# Tezos/Etherlink Agent Receipts Note

This note describes the first Tezos/Etherlink-specific scope for Aweb Agent
Receipts.

Aweb Tezos/Etherlink Agent Receipts are designed for developer-experience and
security-review workflows around agent-assisted contract, rollup, or application
actions. The receipt records scoped authority, contract or rollup context,
simulation state, cost, outcome, failure, recovery, and redaction boundaries before
any live transaction is signed or submitted.

The first milestone does not build a wallet, custody funds, launch a token, or claim
production Tezos or Etherlink execution.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before the agent acts,
- contract or rollup context category,
- simulation status,
- cost, failure, retry, recovery, and human-review state,
- digest-grade artifact references where useful.

The public receipt should not publish:

- raw prompts,
- wallet addresses,
- private operator notes,
- provider credentials,
- verbose simulation traces,
- unsigned transaction payloads.

## First Useful Workflow

The first workflow is a testnet-safe or simulated execution review:

1. An operator grants simulation-only authority.
2. An agent reads contract or Etherlink context.
3. The receipt records what was inspected and what remains private.
4. Any signing, transaction submission, or state mutation remains denied.
5. A human reviewer decides whether the next step is a testnet action, more review,
   or rejection.

The sample fixture is `fixtures/tezos-etherlink-execution-receipt.example.json`.

## Why This Matters

AI agents can help developers inspect and prepare workflows, but reviewers still
need durable evidence of authority, context, outcome, and recovery state. Aweb
receipts provide a small, portable record that supports review without exposing raw
agent logs or wallet context.
