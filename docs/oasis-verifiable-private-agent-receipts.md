# Oasis Verifiable Private Agent Receipts Note

This note describes the first Oasis-aware scope for Aweb Agent Receipts.

Aweb Oasis Verifiable Private Agent Receipts are designed for agent workflows that
need private data handling, digest-grade public references, programmable-policy
state, and reviewer-visible recovery without publishing private payloads.

The first milestone does not claim live Oasis/Sapphire execution, custody, token
launch, or production private payments.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before the agent acts,
- private/public/digest-only disclosure mode,
- policy status and redaction reasons,
- digest-grade references,
- cost, failure, recovery, and human-review state.

The public receipt should not publish:

- raw prompts,
- private payloads,
- secrets,
- counterparties,
- private tool arguments,
- provider credentials.

The sample fixture is `fixtures/oasis-verifiable-private-receipt.example.json`.
