# Sonic Agent Payment Receipts Note

This note describes the first Sonic-specific scope for Aweb Agent Receipts.

Aweb Sonic Agent Payment Receipts are designed for payment-adjacent agent workflows
where reviewers need to understand authority, network context, fee or settlement
metadata, policy checks, outcome, failure, recovery, and privacy boundaries before
any transaction is prepared.

The first milestone does not transfer assets, sign transactions, custody funds,
launch a token, or claim production Sonic payment volume.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before the agent acts,
- Sonic network or payment-context category,
- fee, settlement, policy, status, failure, recovery, and cost fields,
- explicit no-transfer and no-signing state,
- redaction reasons for private payment or counterparty material.

The public receipt should not publish:

- raw prompts,
- wallet addresses,
- counterparties,
- private payment intent,
- provider credentials,
- prepared transactions,
- unsafe automation details.

## First Useful Workflow

The first workflow is a read-only payment-context review:

1. An operator grants observe-only authority.
2. An agent reads simulated or verified public network context.
3. The receipt records policy status, missing evidence, and recovery state.
4. The workflow stops before any transaction is prepared.
5. A human reviewer decides whether more evidence or approval is required.

The sample fixture is `fixtures/sonic-payment-review-receipt.example.json`.

## Why This Matters

Agent-assisted payment workflows need a useful evidence surface without normalizing
raw logs or unsafe autonomous capital movement. Aweb receipts show what the agent
was allowed to inspect, what it found, why it stopped, and which private fields
remain withheld.
