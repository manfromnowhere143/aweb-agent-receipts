# Base/Morpho Vault Risk Agent Receipts

This note defines the current Base/Morpho-facing receipt boundary for Aweb Agent
Receipts. It is a simulated public-good proof for reviewer discussion, not a live
vault product, custody service, token launch, investment strategy, or autonomous
capital-allocation system.

The matching fixture is:

- `fixtures/morpho-vault-risk-classifier-receipt.example.json`

## Review Boundary

The receipt is designed for an observe-only vault-risk workflow. It records what an
agent was allowed to inspect, which public data source shaped the result, which
Base/Morpho context was involved, what evidence is incomplete, and why the workflow
must stop before any capital movement or recommendation.

The receipt can record:

- scoped authority granted to the agent,
- Base network context and Morpho-style vault or market metadata class,
- data-provider and tool execution metadata,
- risk dimensions such as curator, liquidity, oracle dependency, collateral quality,
  borrower concentration, smart-contract risk, and data freshness,
- execution status, failure, retry, recovery, and human-review requirements,
- public artifacts or digest-grade references,
- redaction boundaries for raw prompts, wallet addresses, counterparties, private
  portfolios, and provider credentials.

The receipt explicitly refuses:

- deposits,
- withdrawals,
- rebalances,
- investment advice,
- vault launches,
- token launches,
- custody,
- private wallet exposure,
- live user-funds operation.

## First Workflow

1. An operator grants observe-only authority.
2. The agent reads simulated or later verified public Base/Morpho market metadata.
3. The validator records risk dimensions and the data-provider boundary.
4. The receipt marks incomplete evidence and requires human review.
5. Any fund movement, recommendation, deposit, withdrawal, or rebalance remains denied.

## Why Base

Base is a strong first public prototype target because its funding paths emphasize
shipped prototypes, clear documentation, public goods, and builder-visible impact.
For Aweb, the honest next step is to ship a narrow Base-visible proof before asking
for a retroactive Base Builder Grant or weekly builder reward.

The Base/Morpho angle is narrow enough to be useful: DeFi vault and market review
needs evidence that is more explainable than raw agent logs but less sensitive than
private portfolio traces. A receipt can show the authority boundary, data source,
risk dimensions, incomplete evidence, and review state without pretending to be an
investment product.

## Current Status

Current status: simulated public-good proof. The repository has a fixture and this
boundary note, but it does not claim Base mainnet users, live Morpho integration,
onchain deployment, custody, user funds, or production usage.

Before applying to a shipped-project Base route, Aweb should add at least one public
Base-visible demo: a small read-only viewer, Base Sepolia or public-data-only example,
or reproducible CLI flow that validates a Base/Morpho-style receipt from the fixture.

