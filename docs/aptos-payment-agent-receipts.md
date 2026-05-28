# Aptos Payment Agent Receipts Note

This note describes the first Aptos-specific scope for Aweb Agent Receipts.

Aweb Aptos Payment Agent Receipts are designed for simulated, review-first payment and gas-sponsored workflows around scoped authority, Aptos/Move entry-function context, account and asset references, gas policy, sponsorship policy, provider/tool boundaries, failure, recovery, and redaction. The first milestone does not sign transactions, broadcast transactions, move user funds, custody private keys, sponsor gas without explicit policy, operate a wallet, launch a token, or provide investment advice.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before an agent prepares or summarizes an Aptos action,
- Aptos network, Move package, module, entry function, asset class, gas, and sponsorship policy where safe,
- provider or tool boundary,
- status, failure, retry, recovery, and cost,
- redaction reason and disclosure scope,
- optional digest references for reviewer-visible artifacts.

The public receipt should not publish:

- raw prompts,
- private keys or seed material,
- signer accounts unless explicitly public,
- private recipient or amount fields,
- private payment intent,
- unreviewed transaction payloads,
- unsafe automation instructions,
- yield, investment, or asset-value claims.

## First Useful Workflow

The first workflow is a simulated Aptos payment review:

1. An operator grants prepare-only authority.
2. An agent reads public or simulated Aptos/Move context.
3. The validator records Move entry-function context, gas policy, sponsorship policy, and denied signing/broadcast actions.
4. The receipt marks private payment details and incomplete evidence as redacted or `needs_human_review`.
5. Any signing, broadcast, custody, fund movement, gas sponsorship, or production automation remains denied until a separate human-approved workflow exists.

The sample fixture is `fixtures/aptos-payment-review-receipt.example.json`.

## Why This Matters

Aptos is a Move-based chain with strong application, payment, and developer-tooling ambitions. Agent-assisted payment and workflow software needs a review layer before actions reach signing, sponsorship, or production-sensitive operations. Aweb's receipt layer gives builders a compact public-good primitive for checking what an agent was allowed to inspect, which Aptos/Move context shaped the result, why it stopped, and what must be verified before any wallet signature or transaction broadcast.
