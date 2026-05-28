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
- `fixtures/*.example.json` - simulated reviewer fixtures across cross-chain, private, payment-adjacent, MoveVM, HCS, Aave pool-risk, DeFi-risk, DEX route-review, Sonic payment-review, Tezos/Etherlink, local wallet-adjacent, stablecoin, verifiable-private, DePIN, and indexing contexts.
- `examples/the-graph-receipt-indexing-subgraph/` - minimal The Graph subgraph skeleton for indexing public receipt metadata.
- `validate-examples.mjs` - local validator for required receipt fields and nested shape checks.
- `docs/redaction-guide.md` - privacy and disclosure boundary for public receipts.
- `docs/aave-agent-risk-receipts.md` - Aave pool-risk receipt boundary.
- `docs/uniswap-agent-receipts.md` - Uniswap route-review receipt boundary.
- `docs/sonic-agent-payment-receipts.md` - Sonic payment-review receipt boundary.
- `docs/tezos-etherlink-agent-receipts.md` - Tezos/Etherlink execution receipt boundary.
- `docs/tether-qvac-wdk-agent-receipts.md` - Tether/QVAC/WDK local-agent receipt boundary.
- `docs/tron-stablecoin-agent-receipts.md` - TRON stablecoin receipt boundary.
- `docs/oasis-verifiable-private-agent-receipts.md` - Oasis private/verifiable receipt boundary.
- `docs/iotex-depin-agent-receipts.md` - IoTeX/DePIN activity receipt boundary.
- `docs/the-graph-agent-receipt-indexing.md` - The Graph metadata indexing receipt boundary.
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
- Aave-style read-only pool-risk review evidence.
- Morpho/Base-style read-only vault-risk classifier evidence.
- Uniswap-style read-only route-review evidence.
- Sonic-style read-only payment-context review evidence.
- Tezos/Etherlink-style simulated execution review evidence.
- Tether/QVAC/WDK-style local wallet-adjacent receipt evidence.
- TRON-style stablecoin payment-review evidence.
- Oasis-style verifiable private execution evidence.
- IoTeX/DePIN-style activity-review evidence.
- The Graph-style receipt metadata indexing evidence.

## Current Examples

- `examples/the-graph-receipt-indexing-subgraph/` - a minimal subgraph skeleton that indexes public receipt metadata from a placeholder `ReceiptPublished` event while keeping raw prompts, secrets, counterparties, and private payloads outside the indexed graph.

## License

Apache-2.0.
