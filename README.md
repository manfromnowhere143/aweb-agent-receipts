# Aweb Agent Receipts

Open execution evidence for AI-agent workflows.

This repository contains the first public reviewer corpus for Aweb Agent Receipts:
a compact receipt schema, simulated examples, and a local validator. The goal is to
make agent actions inspectable without exposing raw prompts, secrets, private account
data, counterparties, provider credentials, or unsafe automation details.

## Status

This is an illustrative public-good seed package, not production telemetry and not a
custody, wallet, token, bridge, trading, or live-payment product.

All examples are simulated. Chain identifiers, transaction hashes, account references,
provider identifiers, proofs, costs, and artifacts are placeholders unless explicitly
marked otherwise.

## What A Receipt Records

An Aweb Agent Receipt captures:

- scoped authority before an agent acts,
- the agent, model class, operator, workflow, and capability involved,
- execution status, cost, timing, idempotency, failure, retry, and recovery state,
- evidence artifacts or digest-grade references,
- explicit privacy and redaction boundaries,
- human-review notes for downstream reviewers.

## Repository Layout

- `schema/aweb-agent-receipt.v0.1.schema.json` - compact JSON Schema for the example shape.
- `fixtures/*.example.json` - simulated reviewer fixtures across cross-chain, private, payment-adjacent, MoveVM, HCS, DeFi-risk, DEX route-review, Sonic payment-review, and Tezos/Etherlink contexts.
- `validate-examples.mjs` - local validator for required receipt fields and nested shape checks.
- `docs/redaction-guide.md` - privacy and disclosure boundary for public receipts.
- `docs/uniswap-agent-receipts.md` - Uniswap route-review receipt boundary.
- `docs/sonic-agent-payment-receipts.md` - Sonic payment-review receipt boundary.
- `docs/tezos-etherlink-agent-receipts.md` - Tezos/Etherlink execution receipt boundary.
- `docs/grant-context.md` - how this package supports the Aweb public-good grant track.

## Validate

```bash
npm test
```

or:

```bash
node validate-examples.mjs
```

Expected result:

```json
{
  "ok": true
}
```

## Current Fixtures

- Wormhole-style cross-chain route/message context.
- Hedera HCS-style digest and ordering metadata.
- Movement/MoveVM-style simulated action evidence.
- XRPL-style payment-preparation evidence with no signing or broadcast.
- Aleo-style selective-disclosure/private execution evidence.
- Zcash-style private-agent receipt with no raw log boundary.
- Morpho/Base-style read-only vault-risk classifier evidence.
- Uniswap-style read-only route-review evidence.
- Sonic-style read-only payment-context review evidence.
- Tezos/Etherlink-style simulated execution review evidence.

## License

Apache-2.0.
