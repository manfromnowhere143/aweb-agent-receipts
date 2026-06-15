#!/usr/bin/env node
// Generates a schema-conforming public corpus fixture for a governed Solana
// execute-with-human-approval receipt, by running the real kit lifecycle offline
// and rendering the broadcast receipt via toPublicSpecReceipt().
//
// Output: ../../fixtures/solana-governed-execution-receipt.example.json
// Apache-2.0.

import { writeFile } from 'node:fs/promises';
import {
  GovernedSolanaAgent,
  MockSolanaConnection,
  MockSessionSigner,
  buildPlan,
  defaultPolicyProfile,
  toPublicSpecReceipt,
  MEMO_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from '../src/index.mjs';

let t = 1_760_000_000_000;
const now = () => (t += 1000);

const plan = buildPlan({
  intent: 'Launch Aweb Demo: on-chain launch marker + small account seed',
  feePayer: 'SESSdevnetScopedSignerPublicKeyPlaceholder1',
  cluster: 'devnet',
  instructions: [
    { programId: MEMO_PROGRAM_ID, kind: 'memo', accounts: [], dataSummary: 'memo: "Aweb Demo launched — governed agent action"' },
    {
      programId: SYSTEM_PROGRAM_ID,
      kind: 'transfer',
      lamports: 1_000_000,
      accounts: [
        { pubkey: 'SESSdevnetScopedSignerPublicKeyPlaceholder1', isSigner: true, isWritable: true },
        { pubkey: 'ProjectVaultDevnetPlaceholder1111111111111', isSigner: false, isWritable: true },
      ],
      dataSummary: 'system transfer 0.001 SOL to project account (devnet)',
    },
  ],
});

const agent = new GovernedSolanaAgent({
  connection: new MockSolanaConnection({ seed: 'aweb-corpus-fixture' }),
  signer: new MockSessionSigner({ label: 'aweb-corpus-session' }),
  policy: defaultPolicyProfile(),
  approvalSecret: 'fixture-runtime-secret-not-persisted',
  now,
});

agent.plan(plan);
await agent.simulate();
agent.grantApproval({ approvedBy: 'operator:daniel-wahnich' });
await agent.sign();
await agent.broadcast();

const chain = agent.verifyReceipts();
if (!chain.verified) throw new Error('receipt chain failed verification');

const broadcast = agent.ledger.all.find((r) => r.step === 'broadcast');
const fixture = {
  ...toPublicSpecReceipt(broadcast),
  receipt_id: 'aweb-example-solana-governed-execution-001',
  created_at: '2026-06-15T00:00:00Z',
  _note: 'Simulated, deterministic example produced by @aweb-labs/solana-agent-kit. Not live chain data. Signature/slot are mock values.',
};

const out = new URL('../../../fixtures/solana-governed-execution-receipt.example.json', import.meta.url);
await writeFile(out, JSON.stringify(fixture, null, 2) + '\n', 'utf8');
console.log('wrote', out.pathname);
console.log('receipt chain verified:', chain.verified, '| receipts:', chain.length);
