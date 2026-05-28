# The Graph Receipt Indexing Subgraph

This is a minimal subgraph skeleton for indexing public Aweb Agent Receipt metadata.

It is designed as a reviewer-facing demo, not a deployed production index. The
placeholder contract address, start block, and event source must be replaced before
deployment.

## Boundary

The indexed graph should contain public metadata only:

- receipt id and scope,
- metadata URI or digest reference,
- authority mode and denied action classes,
- workflow and capability summaries,
- human-review and recovery state,
- redaction boundary flags.

The indexed graph should not contain:

- raw prompts,
- secrets,
- wallet keys,
- private counterparties,
- provider credentials,
- unredacted artifact bodies,
- private execution payloads.

## Files

- `subgraph.yaml` - subgraph manifest with a placeholder `ReceiptRegistry` event source.
- `schema.graphql` - entities for public receipt metadata and redaction state.
- `abis/ReceiptRegistry.json` - minimal ABI containing the `ReceiptPublished` event.
- `src/receipt-registry.ts` - AssemblyScript mapping that writes metadata-only entities.
- `sample-query.graphql` - reviewer queries for failed/review-required receipts and redaction boundaries.

## Local Build Path

After replacing the placeholder contract address and start block with a real testnet
registry, a builder would run:

```bash
graph codegen
graph build
```

This repository does not claim that the demo is deployed. It is a reproducible
subgraph skeleton for grant review and future Graph-native implementation work.
