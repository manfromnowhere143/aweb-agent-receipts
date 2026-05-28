# The Graph Agent Receipt Indexing Note

This note describes the first The Graph-specific scope for Aweb Agent Receipts.

Aweb Graph-indexed Agent Receipts are designed for reviewer workflows where public
receipt metadata should be queryable without publishing raw prompts, secrets,
counterparties, wallet material, or private execution payloads.

The first local milestone is an indexing profile and simulated fixture. It is not
a deployed subgraph, Substreams module, token launch, custody product, wallet, or
production index.

## Receipt Boundary

The public indexed surface should preserve:

- receipt id, version, created time, and public scope,
- authority grant mode and allowed/denied action classes,
- workflow id, intent summary, environment, and capability category,
- execution status, cost, failure, retry, recovery, and human-review state,
- artifact references or digests,
- redaction policy and redacted field names.

The public indexed surface should not publish:

- raw prompts,
- private execution payloads,
- wallet secrets,
- counterparties,
- provider credentials,
- unredacted artifact bodies,
- unsafe automation details.

## First Useful Workflow

The first workflow is metadata-only receipt discovery:

1. An operator grants observe-only authority.
2. An agent derives public receipt metadata entities from a simulated receipt.
3. The receipt records which entities could be indexed and which data stays
   private.
4. A reviewer queries for receipts that require human review, contain failed
   workflows, or include redacted artifacts with recovery state.
5. The workflow stops before any private payload is indexed.

The sample fixture is `fixtures/the-graph-receipt-indexing.example.json`.

## Why This Matters

Agent receipts become more useful when reviewers can discover and compare them
across workflows. The Graph is relevant when receipt metadata needs to be indexed
and queried as public infrastructure while sensitive execution details remain
outside the indexed graph.
