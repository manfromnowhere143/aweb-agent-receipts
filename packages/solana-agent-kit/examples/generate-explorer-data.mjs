#!/usr/bin/env node
// Writes a full governed-run receipt ledger to explorer/sample-run.json so the
// zero-dependency receipt explorer can render + verify it in the browser.
// Apache-2.0. Deterministic, offline, no secrets.

import { writeFile } from 'node:fs/promises';
import {
  GovernedSolanaAgent,
  MockSolanaConnection,
  MockSessionSigner,
  buildPlan,
  defaultPolicyProfile,
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
  connection: new MockSolanaConnection({ seed: 'aweb-explorer-run' }),
  signer: new MockSessionSigner({ label: 'aweb-explorer-session' }),
  policy: defaultPolicyProfile(),
  approvalSecret: 'explorer-runtime-secret-not-persisted',
  now,
});

agent.plan(plan);
await agent.simulate();
agent.grantApproval({ approvedBy: 'operator:daniel-wahnich' });
await agent.sign();
await agent.broadcast();

const chain = agent.verifyReceipts();
const payload = {
  _note: 'Deterministic offline demo run from @aweb-labs/solana-agent-kit. Mock signature/slot; not live chain data.',
  chain_verified: chain.verified,
  receipt_count: chain.length,
  receipts: agent.ledger.all,
};

const jsonOut = new URL('../explorer/sample-run.json', import.meta.url);
await writeFile(jsonOut, JSON.stringify(payload, null, 2) + '\n', 'utf8');

// JS fallback so explorer/index.html renders by just being opened (no server /
// no fetch, which file:// often blocks).
const jsOut = new URL('../explorer/sample-run.js', import.meta.url);
await writeFile(jsOut, `window.AWEB_SAMPLE_RUN = ${JSON.stringify(payload, null, 2)};\n`, 'utf8');

console.log('wrote', jsonOut.pathname, 'and sample-run.js | verified:', chain.verified, '| receipts:', chain.length);
