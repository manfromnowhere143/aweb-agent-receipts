# Bitcoin And Lightning Agent Receipts

This note describes the simulated Bitcoin/Lightning payment-review fixture in:

`fixtures/bitcoin-lightning-payment-review-receipt.example.json`

## Purpose

The fixture shows how an agent receipt can preserve payment-review evidence without giving an AI agent custody, signing authority, broadcast authority, or private-key access.

The intended OpenSats/freedom-tech angle is narrow:

- review-only invoice context,
- redacted counterparty and memo metadata,
- explicit no-payment state,
- human review before signing or payment,
- no seed phrase, private key, custody, or automated fund movement.

## What The Receipt Records

- scoped authority before review,
- denied actions around signing, broadcast, custody, key material, and payment,
- invoice-policy evidence,
- payment status as `reviewed_not_paid`,
- redaction boundary for invoice, counterparty, memo, wallet, and credentials,
- recovery state requiring wallet-side human confirmation.

## Boundary

This is not a wallet, Lightning node, custody service, payment processor, yield product, investment product, or automated payment agent.

All example values are simulated placeholders. The agent does not sign, broadcast, pay an invoice, store a seed phrase, handle a private key, or move funds.

## Why It Matters

AI-assisted Bitcoin and Lightning workflows will need a standard way to prove what the agent was allowed to inspect and what it did not do. A receipt gives builders a reviewable record without turning an AI agent into a wallet controller.
