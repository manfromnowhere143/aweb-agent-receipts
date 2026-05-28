# Roadmap

This roadmap is scoped for the public Agent Receipts package. It does not imply
custody, live-funds automation, wallet control, bridge operation, or production chain
execution.

## v0.1 - Public Reviewer Corpus

Status: published.

- JSON Schema for simulated receipt examples.
- Seven simulated fixtures.
- Local validator.
- Redaction guide.
- Grant-context notes.
- Apache-2.0 license and contribution rules.

## v0.2 - Receipt Profile And Validator

- Convert the illustrative schema into a stricter public receipt profile.
- Add unsafe-field checks for prompts, secrets, credentials, private account data,
  viewing keys, memos, counterparties, private notes, and raw provider payloads.
- Add clearer status, failure, retry, recovery, and human-review state machines.
- Add CI validation for all fixtures.

## v0.3 - TypeScript Helpers

- Create receipt constructors.
- Add redaction helpers.
- Add typed schema exports.
- Add package-level examples for agent frameworks, MCP/API tools, and chain-adjacent
  workflows.

## v0.4 - Viewer

- Add a lightweight viewer for authority, capability, outcome, cost, failure,
  recovery, privacy boundary, and review notes.
- Keep private fields hidden or marked as redacted.
- Include reviewer-friendly example pages for each fixture.

## v0.5 - Ecosystem Adapters

Potential adapters depend on grant and community feedback. Candidate tracks include:

- privacy-preserving receipts,
- cross-chain route/message receipts,
- payment-preparation receipts,
- MoveVM/action-simulation receipts,
- DeFi pool and risk-review receipts,
- public-good receipt indexing,
- permanent archive references.

Every adapter should preserve the same safety boundary: no raw prompts, no secrets,
no private payloads, no custody claims, and no unsafe automation details on public
surfaces.
