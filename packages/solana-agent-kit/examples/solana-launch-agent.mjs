#!/usr/bin/env node
// Aweb Solana AgentKit — "Solana Project Launch Agent" demo.
//
// Watch an AI agent complete a governed, on-chain Solana action end-to-end:
//   plan -> simulate -> HUMAN APPROVAL GATE -> sign -> broadcast -> verifiable receipt.
//
// Runs OFFLINE by default (MockSolanaConnection + MockSessionSigner): zero
// install, zero network, zero secrets — reproducible anywhere.
//
// Live devnet mode is documented at the bottom of this file. Apache-2.0.

import {
  GovernedSolanaAgent,
  GovernanceError,
  MockSolanaConnection,
  MockSessionSigner,
  buildPlan,
  defaultPolicyProfile,
  toPublicSpecReceipt,
  MEMO_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from '../src/index.mjs';

const bar = (c = '─') => c.repeat(64);
const h = (t) => console.log(`\n${bar()}\n  ${t}\n${bar()}`);

// A deterministic clock so the demo output is reproducible (no Date.now()).
let t = 1_760_000_000_000;
const now = () => (t += 1000);

async function main() {
  h('AWEB SOLANA AGENTKIT — Solana Project Launch Agent');
  console.log('  Goal (user prompt):');
  console.log('    "Launch my Solana project \'Aweb Demo\' — write an on-chain');
  console.log('     launch marker and seed the project account on devnet."\n');
  console.log('  Mode: OFFLINE (mock connection + mock scoped signer). No secrets.');

  // 1) The agent decomposes the goal into a typed Solana plan.
  const plan = buildPlan({
    intent: 'Launch Aweb Demo: on-chain launch marker + small account seed',
    feePayer: 'MOCKSESSc0ffee', // overwritten by the signer below in a real flow
    cluster: 'devnet',
    instructions: [
      {
        programId: MEMO_PROGRAM_ID,
        kind: 'memo',
        accounts: [],
        dataSummary: 'memo: "Aweb Demo launched — governed agent action"',
      },
      {
        programId: SYSTEM_PROGRAM_ID,
        kind: 'transfer',
        lamports: 1_000_000, // 0.001 SOL devnet, under the 0.05 cap
        accounts: [
          { pubkey: 'MOCKSESSc0ffee', isSigner: true, isWritable: true },
          { pubkey: 'ProjectVaultDevnet1111111111111111111111111', isSigner: false, isWritable: true },
        ],
        dataSummary: 'system transfer 0.001 SOL to project account (devnet)',
      },
    ],
  });

  const agent = new GovernedSolanaAgent({
    connection: new MockSolanaConnection(),
    signer: new MockSessionSigner({ label: 'aweb-demo-session' }),
    policy: defaultPolicyProfile(),
    approvalSecret: 'demo-runtime-secret-not-persisted',
    now,
  });

  // 2) PLAN — policy evaluation.
  h('STEP 1 — PLAN  (Maestro decomposes -> typed Solana steps)');
  const planned = agent.plan(plan);
  console.log('  Instructions :', plan.instructions.map((i) => i.kind).join(' + '));
  console.log('  Risk class   :', planned.evaluation.riskClass);
  console.log('  Decision     :', planned.evaluation.decision);
  planned.evaluation.reasons.forEach((r) => console.log('   -', r));

  // 3) SIMULATE — required before any broadcast.
  h('STEP 2 — SIMULATE  (simulate-by-default, no signature yet)');
  const sim = await agent.simulate();
  console.log('  Simulation OK:', sim.ok);
  console.log('  Compute units:', sim.computeUnits);
  console.log('  Est. fee     :', sim.feeLamports, 'lamports (devnet)');
  console.log('  Lifecycle    :', agent.state.lifecycle);

  // 4) Demonstrate the safety invariant: signing is blocked before approval.
  h('STEP 3 — APPROVAL GATE  (agent CANNOT sign without a human grant)');
  try {
    await agent.sign();
    console.log('  !! UNEXPECTED: signing succeeded without approval');
  } catch (err) {
    if (err instanceof GovernanceError) {
      console.log('  ✔ Signing blocked as designed:');
      console.log('    ', err.message);
    } else throw err;
  }

  // 5) A human reviews the simulated tx and grants a scoped, single-use approval.
  console.log('\n  >> Human reviews the simulated transaction and approves <<');
  const token = agent.grantApproval({ approvedBy: 'operator:daniel-wahnich' });
  console.log('  Approval token : bound to planHash', agent.state.planHash.slice(0, 16) + '…');
  console.log('  Single-use nonce:', token.nonce.slice(0, 12) + '…  (anti-replay)');

  // 6) SIGN + BROADCAST — now permitted, exactly once.
  h('STEP 4 — SIGN + BROADCAST  (scoped session signer, governed)');
  await agent.sign();
  const result = await agent.broadcast();
  console.log('  Signature    :', result.signature.slice(0, 24) + '…');
  console.log('  Slot         :', result.slot);
  console.log('  Status       :', result.confirmationStatus);
  console.log('  Explorer     : https://explorer.solana.com/tx/' + result.signature + '?cluster=devnet');

  // 7) Prove replay protection: the same approval token cannot be reused.
  console.log('\n  Replay check : attempting to reuse the approval token…');
  try {
    agent.state.lifecycle = 'APPROVED'; // force back to test the nonce guard
    await agent.sign();
    console.log('  !! UNEXPECTED: token reuse succeeded');
  } catch (err) {
    console.log('  ✔ Token reuse blocked:', err.message.split(' (')[1]?.replace(')', '') ?? 'replay');
  }

  // 8) RECEIPTS — the verifiable evidence chain.
  h('STEP 5 — RECEIPTS  (hash-chained, verifiable evidence)');
  const chain = agent.verifyReceipts();
  console.log('  Receipts     :', chain.length);
  console.log('  Chain verified:', chain.verified);
  agent.ledger.all.forEach((r, i) => {
    console.log(
      `   ${i + 1}. ${r.step.padEnd(14)} ${r.execution.status.padEnd(18)} hash=${r.receipt_hash.slice(0, 12)}…`,
    );
  });

  // The broadcast receipt, rendered as a public-spec example fixture.
  const broadcastReceipt = agent.ledger.all.find((r) => r.step === 'broadcast');
  console.log('\n  Public-spec receipt (broadcast):');
  console.log(
    JSON.stringify(toPublicSpecReceipt(broadcastReceipt), null, 2)
      .split('\n')
      .map((l) => '    ' + l)
      .join('\n'),
  );

  h('DONE — governed, simulated-first, approval-gated, receipted.');
  console.log('  Boundary: devnet · scoped session signer (no user custody) ·');
  console.log('  simulate-by-default · approval-gated · no secrets in receipts.\n');
}

main().catch((err) => {
  console.error('demo failed:', err);
  process.exit(1);
});

/*
 * ── LIVE DEVNET MODE ───────────────────────────────────────────────────────
 * The offline demo above proves the governance. To run a REAL devnet action:
 *
 *   1. npm i @solana/web3.js tweetnacl     (in your app, not this repo)
 *   2. Create a devnet keypair and airdrop free devnet SOL (no real value):
 *        solana-keygen new -o devnet.json
 *        solana airdrop 1 --url devnet <PUBKEY>
 *   3. Provide the keypair bytes at RUNTIME (never commit them):
 *        const bytes = JSON.parse(process.env.AWEB_DEVNET_KEYPAIR)
 *   4. Wire the live ports:
 *        const signer = await createWeb3SessionSigner({ secretKeyBytes: bytes })
 *        const connection = await createWeb3Connection({
 *          endpoint: 'https://api.devnet.solana.com', cluster: 'devnet',
 *          translate: (plan, web3, pk) => buildWeb3Tx(plan, web3, signer._keypair),
 *        })
 *        const agent = new GovernedSolanaAgent({ connection, signer, approvalSecret })
 *   5. Run the identical plan->simulate->approve->sign->broadcast flow.
 *
 * The governance core does not change between mock and live: the same approval
 * gate, the same receipts, the same invariants. Only the ports differ.
 */
