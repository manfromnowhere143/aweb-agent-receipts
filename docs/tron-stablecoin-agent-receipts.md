# TRON Stablecoin Agent Receipts Note

This note describes the first TRON-specific scope for Aweb Agent Receipts.

Aweb TRON Stablecoin Agent Receipts are designed for payment-adjacent agent
workflows where reviewers need to inspect authority, policy, fee class, failure,
recovery, and redaction boundaries without exposing counterparties or moving funds.

The first milestone does not sign transactions, broadcast transactions, custody
funds, process payments, launch a token, or claim production stablecoin volume.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before the agent acts,
- stablecoin/payment context category,
- no-signing and no-broadcast status,
- policy checks, cost, failure, recovery, and human-review state,
- optional digest references for payment-policy evidence.

The public receipt should not publish:

- raw prompts,
- source or destination accounts,
- counterparties,
- private payment intent,
- prepared transactions,
- provider credentials.

The sample fixture is `fixtures/tron-stablecoin-review-receipt.example.json`.
