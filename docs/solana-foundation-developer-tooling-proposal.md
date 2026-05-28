# Aweb Solana Agent Action Receipts

## Summary

Aweb Solana Agent Action Receipts is an Apache-2.0 developer-tooling proposal for making agent-assisted Solana workflows reviewable before any wallet signature, transaction broadcast, fund movement, or production automation occurs.

The project extends Aweb Agent Receipts with a Solana-specific receipt profile, TypeScript helpers, JSON Schema coverage, CLI validation, sample receipts, tests, documentation, and a lightweight reviewer surface. The receipt records scoped authority, Solana program/RPC context, instruction class, compute-budget and fee-policy context, tool/provider execution, outcome, failure, retry, recovery, and redaction boundaries.

This is public-good infrastructure. It is not a wallet, custody product, token launch, trading bot, RPC spam system, investment product, or live user-funds operation.

## Public-Good Value For Solana

Solana makes high-throughput, low-cost application actions practical. That strength also makes review quality important as AI agents begin to inspect, summarize, simulate, and eventually assist with application actions.

Builders should be able to inspect:

- what an agent was allowed to inspect,
- which Solana cluster, program, account, instruction, RPC, compute, and fee-policy context shaped the result,
- which offchain tools or providers were involved,
- what evidence was incomplete, stale, failed, retried, or redacted,
- why a workflow stopped before any production-sensitive action.

Aweb turns that review trail into a portable open-source receipt instead of leaving it inside private logs, raw prompts, wallet histories, provider dashboards, or one-off framework traces.

## Why Solana

Solana is especially relevant because its speed, low fees, and broad application surface make agent-assisted workflows plausible earlier than in slower or more expensive environments. A Solana receipt profile can help developers build safer review practices before agent workflows reach signing, execution, DeFi, wallet, payments, or high-volume application paths.

The first milestone is intentionally conservative and simulate-only. It records review evidence and stop conditions, not live actions.

## Current Proof

The public Aweb Agent Receipts repository already includes a Solana action-review fixture and Solana receipt note:

- `fixtures/solana-action-review-receipt.example.json`
- `docs/solana-agent-action-receipts.md`
- public tag: `v0.1.9`

Local validation passes across the full simulated fixture corpus.

## Deliverables

1. Solana action receipt profile and safety model.
2. TypeScript schema/helpers and CLI validator updates.
3. Solana sample receipt corpus covering program/RPC context, simulation, compute and fee evidence, rejected signing, failure, retry, recovery, and human-review handoff.
4. Lightweight viewer, documentation, tests, and ecosystem feedback report for Solana builders and Solana Foundation reviewers.

All funded deliverables will be open source under Apache-2.0.

## Milestones And Budget

Total request: USD 45,000.

Total duration: 3 months.

### Milestone 1: Solana Action Receipt Profile And Safety Model

Budget: USD 8,000.

Duration: 3 weeks.

Activities:

- Define Solana-specific receipt fields for scoped authority, cluster, program/account category, instruction class, RPC source, compute-budget estimate, fee-policy context, transaction-simulation state, status, failure, recovery, and redaction.
- Define denied actions for the first milestone: signing, broadcast, private-key handling, fund movement, RPC abuse, trading automation, and investment advice.
- Publish threat model and reviewer boundary.

Deliverables:

- Solana receipt profile.
- Safety and redaction boundary note.
- Updated JSON Schema coverage for the Solana fixture class.

### Milestone 2: TypeScript Helpers And CLI Validator

Budget: USD 12,000.

Duration: 4 weeks.

Activities:

- Implement TypeScript helper functions for producing and reading Solana action receipts.
- Extend the CLI validator with Solana-specific checks and unsafe-fixture failures.
- Add tests for required fields, redaction state, denied actions, and incomplete simulation evidence.

Deliverables:

- TypeScript helper module.
- CLI validation updates.
- Test coverage for Solana receipt examples.

### Milestone 3: Solana Sample Receipt Corpus

Budget: USD 11,000.

Duration: 3 weeks.

Activities:

- Publish simulated receipts for program/RPC context review, simulation evidence, compute/fee evidence, rejected signing, failure, retry, recovery, and human-review handoff.
- Keep all examples testnet-safe or simulated.
- Document what each example proves and what it intentionally does not prove.

Deliverables:

- Solana sample receipt corpus.
- Example documentation.
- Validator coverage across the examples.

### Milestone 4: Viewer, Documentation, And Ecosystem Feedback Report

Budget: USD 14,000.

Duration: 3 weeks.

Activities:

- Add a lightweight receipt viewer for reviewer-facing inspection.
- Publish integration notes for Solana developers.
- Gather feedback from Solana builders or reviewers where available.
- Produce a final report with recommended next steps.

Deliverables:

- Lightweight viewer.
- Developer documentation.
- Final ecosystem feedback report.

## Team

Daniel Wahnich is the founder and project lead of Aweb Labs. Daniel is building Aweb as governed execution infrastructure for AI agents across models, MCP tools, APIs, providers, cloud services, inboxes, and background workers.

Relevant work includes the public Aweb Agent Receipts repository, JSON Schema direction, sample receipt corpus, validator path, redaction guide, and ecosystem-specific grant packets for blockchain and privacy-oriented workflows.

## Success Metrics

During the grant period:

- Solana receipt profile published.
- TypeScript helpers and CLI validator updates shipped.
- Solana sample receipt corpus published.
- Local validation passing for all examples.
- Documentation and lightweight viewer available.

Within 6 months after completion:

- 5-10 Solana builders or reviewers inspect, fork, adapt, or reference the receipt profile.
- At least one round of ecosystem feedback incorporated if Solana community review is available.

Within 12 months after completion:

- 25-50 developers or reviewers encounter, fork, adapt, or reference the model if the Solana ecosystem finds the primitive useful.

## Boundaries

This proposal does not claim current Solana production users, current Solana transaction volume, deployed Solana programs, or existing Solana Foundation endorsement.

The first milestone is developer infrastructure and simulated/testnet-safe review tooling. Production signing, broadcast, custody, fund movement, trading, high-volume automation, and private-key handling are explicitly outside scope.
