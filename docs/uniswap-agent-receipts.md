# Uniswap Agent Receipts Note

This note describes the first Uniswap-specific scope for Aweb Agent Receipts.

Aweb Uniswap Agent Execution Receipts are designed for read-only, review-first agent workflows around route analysis, quote context, pool metadata, slippage policy, hook or extension context, failure state, cost, and recovery. The first milestone does not execute swaps, provide liquidity, sign transactions, custody user funds, launch a token, or publish private wallet intent.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before the agent acts,
- provider or tool context,
- route or pool metadata category,
- status, failure, retry, recovery, and cost,
- redaction reason and disclosure scope,
- optional digest references for reviewer-visible artifacts.

The public receipt should not publish:

- raw prompts,
- wallet addresses,
- private portfolio context,
- exact trade intent,
- provider credentials,
- private user notes,
- unreviewed transaction payloads.

## First Useful Workflow

The first workflow is a read-only route review:

1. An operator grants observe-only authority.
2. An agent reads simulated or verified public route context.
3. The validator records the fields needed for review.
4. The receipt marks unsafe or incomplete evidence as `needs_human_review`.
5. Any swap, signing, or liquidity action remains denied until a separate human-approved workflow exists.

The sample fixture is `fixtures/uniswap-route-review-receipt.example.json`.

## Why This Matters

Agent-assisted DeFi workflows can become unsafe if raw logs are the only evidence surface. A transaction hash is too narrow, while raw prompts and wallet context leak too much. Aweb's receipt layer is a middle path: it records what the agent was allowed to do, what it observed, why it stopped, and what a reviewer must check next.
