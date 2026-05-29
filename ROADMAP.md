# Roadmap

This roadmap is scoped to the public Agent Control Specs package. It does not imply production telemetry, hosted Mission Control Cloud, custody, live-funds automation, wallet control, bridge operation, production deployment authority, security remediation authority, or autonomous external communication.

## v0.1 - Public Reviewer Corpus

Status: current.

- Mission Contract example schema.
- Agent Receipt example schema.
- Simulated Mission Contract example for communications/funding ops.
- Simulated non-crypto receipt examples for email, GitHub PR review, cloud deploy approval, security ticket triage, CRM/funding ledger updates, and accounting approval.
- Simulated high-risk Web3/payment-adjacent stress-test fixtures.
- Local validator.
- Source-only TypeScript helper package.
- Redaction, security, no-crypto-required, and open-core boundary docs.
- Apache-2.0 license and contribution rules.

## v0.2 - Stricter Public Profiles

- Convert illustrative schemas into stricter public profiles.
- Split schema profiles by domain-neutral core, business operations, developer operations, cloud operations, security operations, finance operations, and high-risk stress-test examples.
- Add unsafe-field checks for prompts, secrets, credentials, private account data, customer records, source code, vulnerability details, invoice details, wallet material, private notes, and raw provider payloads.
- Add clearer status, failure, retry, recovery, approval, and redaction state machines.
- Add CI validation for all fixtures.

## v0.3 - TypeScript Package Hardening

- Add generated typed schema exports.
- Add Mission Contract and Agent Receipt constructors.
- Add redaction helpers.
- Add receipt-to-contract link helpers.
- Add package-level examples for agent frameworks, MCP/API tools, business workflows, and optional chain-adjacent workflows.

## v0.4 - Viewer

- Add a lightweight static viewer for Mission Contracts and Agent Receipts.
- Show authority, capability, outcome, cost, failure, recovery, privacy boundary, and review notes.
- Keep private fields hidden or marked as redacted.
- Include reviewer-friendly example pages for non-crypto workflows first.

## v0.5 - Ecosystem Adapters

Potential adapters depend on customer, grant, and community feedback. Candidate tracks include:

- business communications receipts,
- GitHub and developer-operations receipts,
- cloud-deploy approval receipts,
- security-ticket triage receipts,
- CRM/funding ledger receipts,
- accounting and spend-approval receipts,
- privacy-preserving receipts,
- public-good receipt indexing,
- optional chain-adjacent stress-test receipts.

Every adapter should preserve the same safety boundary: no raw prompts, no secrets, no private payloads, no custody claims, no unsafe automation details, no silent external side effects, and no production mutation without explicit approval.
