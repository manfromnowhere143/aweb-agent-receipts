# Stellar Payment Agent Receipts Note

This note describes the first Stellar-specific scope for Aweb Agent Receipts.

Aweb Stellar Payment Agent Receipts are designed for simulated, review-first payment and stablecoin workflows around scoped authority, Stellar asset context, memo policy, optional Soroban or Horizon context, provider/tool boundaries, outcome, failure, recovery, and redaction. The first milestone does not sign transactions, broadcast transactions, move user funds, custody secret keys, publish private counterparties, issue assets, promise yield, or provide investment advice.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before an agent reads, prepares, or summarizes payment context,
- Stellar network, asset, memo-policy, Soroban, Horizon, and fee context where safe,
- provider or tool boundary,
- status, failure, retry, recovery, and cost,
- redaction reason and disclosure scope,
- optional digest references for reviewer-visible artifacts.

The public receipt should not publish:

- raw prompts,
- secret keys or seed material,
- wallet addresses unless explicitly public,
- private payment intent,
- private memos,
- counterparties,
- unreviewed transaction payloads,
- unsafe automation instructions,
- yield, investment, or asset-value claims.

## First Useful Workflow

The first workflow is a simulated Stellar payment review:

1. An operator grants prepare-only authority.
2. An agent reads simulated or verified public Stellar payment context.
3. The validator records the fields needed for review.
4. The receipt marks incomplete or sensitive evidence as `needs_human_review`.
5. Any signing, broadcast, custody, fund movement, asset issuance, or production automation remains denied until a separate human-approved workflow exists.

The sample fixture is `fixtures/stellar-payment-review-receipt.example.json`.

## Why This Matters

Stellar is built for practical value movement, including payments and tokenized assets. Agent-assisted payment software needs a review layer before workflows reach signing, broadcast, or production-sensitive operations. Aweb's receipt layer gives builders a small public-good primitive for checking what an agent was allowed to inspect, which Stellar context shaped the result, why it stopped, and what must be verified before a wallet signature or transaction broadcast is considered.
