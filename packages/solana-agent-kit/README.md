# @aweb-labs/solana-agent-kit

**Governed AI-agent execution for Solana.** Let an AI agent run a real Solana
workflow *safely*: it plans the action, simulates it, **pauses for human
approval before any signature**, signs with a scoped session key, broadcasts,
and emits a verifiable hash-chained **receipt** for every step.

> Simulate-by-default · approval-gated signing · scoped signer (no user custody)
> · devnet-first · no secrets in receipts. Apache-2.0.

This is the open, self-contained Solana adapter for the Aweb agent-control model
([Mission Contracts + Agent Receipts](../../README.md)). The governance core has
**zero dependencies** and runs offline, so anyone can inspect it without trusting
a hosted service or installing a chain SDK.

---

## Why

Agents are starting to do real work on Solana — launches, ops, campaigns,
program calls. Tool access alone is unsafe: pointing an autonomous agent at a
wallet with no permissions, no approval, and no audit trail is how funds and
trust get lost. This kit is the missing **execution-and-evidence layer**: the
agent can act, but only inside a governed boundary, and every action leaves a
receipt you can verify.

## The lifecycle (enforced state machine)

```
PLANNED ─▶ SIMULATED ─▶ AWAITING_APPROVAL ─▶ APPROVED ─▶ SIGNED ─▶ BROADCAST ─▶ CONFIRMED
                 │                                                              
                 ├─▶ REJECTED   (policy deny / missing or invalid approval)     
                 └─▶ FAILED     (simulation or broadcast error)                 
```

**Invariants (all tested in `test/governance.test.mjs`):**

1. **Simulate-by-default** — no broadcast without a successful simulation.
2. **Approval-gated signing** — signing is impossible without a valid,
   plan-bound, **single-use** (anti-replay) approval token *and* a human grant.
3. **Receipted** — every transition appends a SHA-256 hash-chained receipt; the
   chain is independently verifiable and tamper-evident.
4. **No secrets** — the session key never leaves the signer; receipts redact
   keys, seeds, tokens, and the raw approval HMAC by design.
5. **Value caps + allowlists + denied instructions** — fail-closed policy.
6. **Mainnet denied by default** — devnet-first; mainnet requires explicit opt-in.

## Quick start (offline, zero install)

```bash
node examples/solana-launch-agent.mjs   # runs the full governed flow with mocks
npm test                                # 16 governance invariants
npm run fixture                         # regenerates the public corpus fixture
```

```js
import {
  GovernedSolanaAgent, MockSolanaConnection, MockSessionSigner,
  buildPlan, defaultPolicyProfile, MEMO_PROGRAM_ID,
} from '@aweb-labs/solana-agent-kit';

const plan = buildPlan({
  intent: 'Write an on-chain launch marker',
  feePayer: signerPubkey,
  cluster: 'devnet',
  instructions: [{ programId: MEMO_PROGRAM_ID, kind: 'memo', accounts: [], dataSummary: 'launch marker' }],
});

const agent = new GovernedSolanaAgent({
  connection: new MockSolanaConnection(),
  signer: new MockSessionSigner(),
  policy: defaultPolicyProfile(),
  approvalSecret: process.env.AWEB_APPROVAL_SECRET, // runtime-only, never persisted
});

agent.plan(plan);
await agent.simulate();
// ...show the simulated tx to a human...
agent.grantApproval({ approvedBy: 'operator:you' });   // explicit human grant
await agent.sign();                                     // blocked without the grant above
await agent.broadcast();
console.log(agent.verifyReceipts());                    // { verified: true, length: N }
```

## Live devnet

The governance core is identical between mock and live — only the **ports**
change. Install the optional peer dep and wire the real adapters:

```bash
npm i @solana/web3.js tweetnacl
solana-keygen new -o devnet.json
solana airdrop 1 --url devnet <PUBKEY>   # free devnet SOL, no real value
```

```js
import { createWeb3Connection, createWeb3SessionSigner } from '@aweb-labs/solana-agent-kit';

const signer = await createWeb3SessionSigner({
  secretKeyBytes: JSON.parse(process.env.AWEB_DEVNET_KEYPAIR), // runtime-only
});
const connection = await createWeb3Connection({
  endpoint: 'https://api.devnet.solana.com',
  cluster: 'devnet',
  translate: buildWeb3TxFromPlan,   // your abstract-plan -> web3.js Transaction
});
const agent = new GovernedSolanaAgent({ connection, signer, approvalSecret });
```

See the bottom of `examples/solana-launch-agent.mjs` for the full live recipe.

## Architecture (hexagonal)

| Module | Responsibility |
| --- | --- |
| `src/policy.mjs` | Risk classification, allowlists, value caps, HMAC approval tokens + nonce anti-replay. |
| `src/receipt.mjs` | Hash-chained receipt ledger, chain verification, redaction, public-spec rendering. |
| `src/kit.mjs` | `GovernedSolanaAgent` — the enforced lifecycle state machine. |
| `src/connection.mjs` | `SolanaConnectionPort`: `MockSolanaConnection` (offline) + `createWeb3Connection` (live). |
| `src/signer.mjs` | `SessionSignerPort`: scoped session signer; key never leaves the signer. |
| `src/index.mjs` | Public API + `buildPlan` helper. |
| `explorer/` | Zero-dependency receipt explorer (open `explorer/index.html`). |

The core (`policy` + `receipt` + `kit`) imports nothing outside Node built-ins.
`@solana/web3.js` is an **optional** peer dependency used only by the live ports.

## Boundary

Not a wallet, not custody, not a token, not a trading bot. The agent uses a
scoped, limited session signer for its own bounded actions; it never holds or
signs with a user's primary wallet. Devnet-first; mainnet is gated behind
explicit policy opt-in, value caps, and program allowlists. Receipts prove *what
executed and what was approved* — not that an outcome was "correct."
