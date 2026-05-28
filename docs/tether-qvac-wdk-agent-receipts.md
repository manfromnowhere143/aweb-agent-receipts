# Tether QVAC/WDK Agent Receipts Note

This note describes the first Tether.dev-specific scope for Aweb Agent Receipts.

Aweb Tether QVAC/WDK Agent Receipts are designed for local-first AI agents and
wallet-adjacent workflows that need useful evidence without turning private local
execution into public raw logs.

The first milestone does not build a wallet, custody product, payment processor,
token launch, or production wallet-action system.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before the agent acts,
- local model/tool or peer-to-peer context category,
- optional wallet-action status without exposing wallet details,
- cost, outcome, failure, retry, recovery, and human-review state,
- redaction reasons for local private data.

The public receipt should not publish:

- raw prompts,
- wallet addresses,
- secrets,
- private wallet context,
- private local payloads,
- prepared transactions,
- provider credentials.

The sample fixture is `fixtures/tether-qvac-wdk-receipt.example.json`.
