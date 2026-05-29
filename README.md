# Aweb Agent Control Specs

Open control and evidence primitives for AI-agent work.

This repository contains the public, Apache-2.0 specification layer for Aweb's agent-control model:

- **Mission Contracts**: pre-execution control objects that define what an agent mission may do.
- **Agent Receipts**: post-execution evidence objects that record what happened, what was approved, what failed, what was redacted, and what remains recoverable.
- **Simulated examples** across business operations, developer operations, cloud operations, security operations, finance operations, and high-risk Web3/payment-adjacent stress tests.
- **Local validation** so reviewers can inspect the examples without trusting a hosted service.

Aweb Mission Control Cloud, Maestro Runtime, Trust Runtime, provider routing, hosted OS9 UI, billing, enterprise controls, and private warehouse internals are not open-sourced here. This repository is the open standard surface: schemas, examples, docs, and validators.

## Status

This is a public specification and reviewer corpus. It is not production telemetry and not a hosted control plane.

All examples are simulated unless explicitly marked otherwise. Examples may include placeholder provider IDs, contract IDs, approval tokens, costs, artifacts, and digests. Do not treat fixture data as live customer, production, financial, blockchain, or operational data.

This repository is not a custody, wallet, token, bridge, trading, payment, deployment, security-remediation, or autonomous external-communication product.

## Why This Exists

Agents are moving from chat into real work: inboxes, pull requests, cloud deploys, security tickets, CRMs, accounting systems, APIs, MCP tools, and business records.

Tool access alone is not enough. Teams need an inspectable boundary for:

- what the agent was authorized to do,
- which capability and provider were used,
- which credential boundary applied,
- which approval gate was required,
- what evidence was collected,
- what was redacted,
- what failed,
- what recovered,
- what should be trusted afterward.

Aweb's public primitive is:

> Mission Contract before execution. Agent Receipt after execution. Operational graph across everything.

## Repository Layout

- `schema/aweb-mission-contract.v0.1.schema.json` - public example schema for pre-execution Mission Contracts.
- `schema/aweb-agent-receipt.v0.1.schema.json` - public example schema for post-execution Agent Receipts.
- `examples/mission-contracts/*.json` - Mission Contract examples.
- `fixtures/*.example.json` - simulated Agent Receipt examples.
- `packages/typescript/` - source-only TypeScript types and lightweight validation helpers.
- `examples/the-graph-receipt-indexing-subgraph/` - minimal metadata-indexing skeleton for public receipt metadata.
- `validate-examples.mjs` - local validator for receipt fixtures, Mission Contract examples, and required docs/examples.
- `docs/open-core-boundary.md` - what is open here and what remains commercial/private.
- `docs/no-crypto-required.md` - how to understand Web3 examples as stress tests, not the company identity.
- `docs/security-model.md` - safety model for public contracts and receipts.
- `docs/redaction-guide.md` - privacy and disclosure boundaries.
- `docs/grant-context.md` - how this package supports public-good and infrastructure-review paths.

## Current Non-Crypto Examples

These are the examples serious AI-infrastructure reviewers should read first:

- `examples/mission-contracts/communications-funding-ops.contract.example.json`
  - A pre-execution contract for a governed communications and funding-ops agent fleet.
- `fixtures/communications-funding-ops-email-draft-receipt.example.json`
  - Email draft prepared; external send and legal/funding claims blocked.
- `fixtures/github-pr-review-receipt.example.json`
  - Pull-request review summarized; merge, push, branch-protection changes, and secret access blocked.
- `fixtures/cloud-deploy-approval-receipt.example.json`
  - Deployment approval packet prepared; production deploy, DNS, secrets, spend, and deletion blocked.
- `fixtures/security-ticket-triage-receipt.example.json`
  - Security ticket triaged; exploit execution, sensitive payload exposure, remediation, and closure blocked.
- `fixtures/crm-funding-ledger-update-receipt.example.json`
  - Approved business-record update recorded with private deal/contact fields redacted.
- `fixtures/accounting-approval-receipt.example.json`
  - Invoice review prepared; payment, vendor-bank changes, spend approval, and purchase-order creation blocked.

## Web3 And Payment-Adjacent Examples

This repository also includes Web3, DeFi, payment-adjacent, privacy, and chain-indexing examples. They are high-risk stress tests for the receipt model, not Aweb's company identity.

They exist because agent-control systems must handle domains where authority, custody, signing, private keys, funds, privacy, and audit boundaries are easy to confuse. Every such fixture is simulated or read-only and explicitly denies custody, token launch, trading, signing, broadcast, bridge operation, payment execution, and investment advice unless a future safe testnet path is separately defined.

Read `docs/no-crypto-required.md` before interpreting those examples.

## What A Mission Contract Records

A Mission Contract captures:

- the user intent and clarified business goal,
- success criteria,
- allowed capabilities,
- credential boundaries,
- approval gates,
- evidence requirements,
- Maestro/Trust execution policy,
- recovery plan,
- receipt schema,
- operational graph.

The contract is meant to be inspectable before an agent touches real tools.

## What An Agent Receipt Records

An Agent Receipt captures:

- scoped authority before the agent acts,
- the agent, operator, workflow, capability, and provider involved,
- execution status, cost, timing, idempotency, failure, retry, and recovery state,
- evidence artifacts or digest-grade references,
- explicit privacy and redaction boundaries,
- human-review notes for downstream reviewers.

The receipt is meant to be inspectable after an agent action.

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

## Open-Core Boundary

Open here:

- public schemas,
- validator,
- TypeScript helper source,
- simulated examples,
- redaction and safety docs,
- selected metadata-indexing examples.

Not open here:

- Aweb Mission Control Cloud,
- Maestro Runtime internals,
- Trust Runtime policy engine,
- provider routing,
- API/MCP warehouse internals,
- OS9 hosted UI,
- approval workflow product,
- hosted cloud, billing, enterprise controls.

The open standard proves the contract and receipt formats. Aweb Mission Control Cloud is the commercial system that compiles, enforces, supervises, recovers, stores, searches, and governs those contracts and receipts.

## License

Apache-2.0.
