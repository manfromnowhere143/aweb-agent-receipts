# Sui Object Agent Receipts Note

This note describes the first Sui-specific scope for Aweb Agent Receipts.

Aweb Sui Object Agent Receipts are designed for simulated, review-first object-centric Move workflows around scoped authority, Sui object references, package/module/function context, programmable transaction block review, gas policy, provider/tool boundaries, failure, recovery, and redaction. The first milestone does not sign transactions, broadcast transactions, mutate live objects, transfer assets, custody keys, publish private inputs, launch a token, or provide investment advice.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before an agent reads, simulates, or summarizes Sui object context,
- Sui network, package, module, function, object-access class, and gas policy where safe,
- provider or tool boundary,
- status, failure, retry, recovery, and cost,
- redaction reason and disclosure scope,
- optional digest references for reviewer-visible artifacts.

The public receipt should not publish:

- raw prompts,
- private keys or seed material,
- private object inputs,
- private operator intent,
- counterparties,
- unreviewed transaction payloads,
- unsafe automation instructions,
- yield, investment, or asset-value claims.

## First Useful Workflow

The first workflow is a simulated Sui object-action review:

1. An operator grants simulate-only authority.
2. An agent reads public or simulated Sui object metadata and Move call context.
3. The validator records object-access class, programmable transaction block review state, gas policy, and denied signing/broadcast/mutation actions.
4. The receipt marks private inputs and incomplete evidence as redacted or human-review-gated.
5. Any signing, broadcast, live object mutation, asset transfer, or production automation remains denied until a separate human-approved workflow exists.

The sample fixture is `fixtures/sui-object-action-review-receipt.example.json`.

## Why This Matters

Sui's object-centric architecture makes ownership, object access, and programmable transaction boundaries central to application safety. Agent-assisted Sui software needs a review layer before workflows mutate objects or broadcast transactions. Aweb's receipt layer gives builders a small public-good primitive for checking what an agent was allowed to inspect, which Sui object context shaped the result, why it stopped, and what must be verified before any production-sensitive action.
