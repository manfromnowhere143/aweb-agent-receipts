# Solana Agent Action Receipts Note

This note describes the first Solana-specific scope for Aweb Agent Receipts.

Aweb Solana Agent Action Receipts are designed for simulated, review-first agent workflows around Solana program context, RPC/provider context, compute-budget estimates, priority-fee policy, transaction simulation state, failure, recovery, and redaction. The first milestone does not sign transactions, broadcast transactions, move user funds, custody keys, run trading automation, spam RPC endpoints, publish private wallet intent, or provide investment advice.

## Receipt Boundary

The public receipt should preserve:

- scoped authority before an agent reads, simulates, or summarizes action context,
- Solana cluster, program, instruction, account, RPC, compute, and fee-policy context where safe,
- provider or tool boundary,
- status, failure, retry, recovery, and cost,
- redaction reason and disclosure scope,
- optional digest references for reviewer-visible artifacts.

The public receipt should not publish:

- raw prompts,
- private keys or seed material,
- wallet addresses unless explicitly public,
- private account context,
- exact user intent,
- unreviewed transaction payloads,
- unsafe automation instructions,
- RPC abuse, front-running, or priority-fee manipulation details.

## First Useful Workflow

The first workflow is a simulated Solana action review:

1. An operator grants simulate-only authority.
2. An agent reads simulated or verified public Solana program/RPC context.
3. The validator records the fields needed for review.
4. The receipt marks incomplete or unsafe evidence as `needs_human_review`.
5. Any signing, broadcast, fund movement, priority-fee bidding, or production automation remains denied until a separate human-approved workflow exists.

The sample fixture is `fixtures/solana-action-review-receipt.example.json`.

## Why This Matters

Solana applications can produce high-throughput, low-latency actions, which makes review quality important before agent-assisted workflows scale. Aweb's receipt layer gives builders a small public-good primitive for checking what an agent was allowed to inspect, what simulation or RPC context shaped the answer, why it stopped, and what must be verified before a wallet signature or transaction broadcast is considered.
