# Aave Agent Risk Receipts Note

This note describes the first Aave-specific scope for Aweb Agent Receipts.

Aweb Aave Agent Risk Receipts are designed for read-only, review-first agent workflows around Aave pool context, reserve metadata, oracle dependency, liquidity and utilization evidence, liquidation-policy context, health-factor policy, failure state, cost, and recovery. The first milestone does not supply assets, borrow assets, withdraw collateral, repay positions, liquidate positions, sign transactions, custody user funds, publish private wallet intent, or provide investment advice.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before the agent reads or summarizes data,
- provider or tool context,
- Aave pool or reserve metadata category,
- status, failure, retry, recovery, and cost,
- redaction reason and disclosure scope,
- optional digest references for reviewer-visible artifacts.

The public receipt should not publish:

- raw prompts,
- wallet addresses,
- private position data,
- exact user intent,
- provider credentials,
- unreviewed transaction payloads,
- liquidation targets or unsafe automation instructions.

## First Useful Workflow

The first workflow is a read-only Aave pool risk review:

1. An operator grants observe-only authority.
2. An agent reads simulated or verified public Aave pool context.
3. The validator records the fields needed for review.
4. The receipt marks incomplete or unsafe evidence as `needs_human_review`.
5. Any supply, borrow, withdrawal, repayment, liquidation, signing, or recommendation action remains denied until a separate human-approved workflow exists.

The sample fixture is `fixtures/aave-pool-risk-receipt.example.json`.

## Why This Matters

Agent-assisted DeFi workflows can become unsafe if a user sees only a transaction hash after the fact or raw private logs before review. Aweb's receipt layer provides a middle surface: it records what the agent was allowed to inspect, what it observed, why it stopped, and what a reviewer must verify before any Aave-related action can be prepared.
