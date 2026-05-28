# IoTeX DePIN Agent Receipts Note

This note describes the first IoTeX/DePIN-specific scope for Aweb Agent Receipts.

Aweb IoTeX DePIN Agent Receipts are designed for verifiable real-world activity and
device/network workflows where reviewers need evidence without exposing precise
location, device-owner identity, private activity payloads, or device credentials.

The first milestone does not control devices, publish private location, custody
funds, or claim live IoTeX/W3bstream execution.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before the agent acts,
- DePIN activity category,
- digest-grade activity reference,
- privacy policy and redaction state,
- cost, failure, recovery, and human-review state.

The public receipt should not publish:

- raw prompts,
- device-owner identity,
- precise location,
- private activity payloads,
- device credentials,
- provider credentials.

The sample fixture is `fixtures/iotex-depin-activity-receipt.example.json`.
