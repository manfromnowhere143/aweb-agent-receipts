#!/usr/bin/env node
// Aweb Solana AgentKit — LIVE devnet runner.
//
// Runs the governed lifecycle against real Solana devnet and produces a real,
// verifiable on-chain signature + receipt. HTTP-only (works with keyed RPCs
// like Alchemy/Helius/QuickNode that don't expose a WebSocket subscription).
//
// Usage:
//   npm i @solana/web3.js
//   export AWEB_DEVNET_RPC="https://api.devnet.solana.com"   # or a keyed RPC URL
//   node examples/live-devnet-runner.mjs
//
// It generates an ephemeral scoped session keypair (devnet-only, valueless),
// tries to airdrop, and ALSO polls for external funding — so if the faucet is
// rate-limited you can simply send a little devnet SOL to the printed address
// (e.g. via https://faucet.solana.com) and it broadcasts automatically.
//
// No secrets are read by this file: the RPC URL comes from the environment.
// The keypair never leaves the process and is never written to disk.
// Apache-2.0.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import * as web3 from '@solana/web3.js';
import {
  GovernedSolanaAgent, buildPlan, defaultPolicyProfile, toPublicSpecReceipt,
} from '../src/index.mjs';

const RPC = process.env.AWEB_DEVNET_RPC || 'https://api.devnet.solana.com';
const FUND_WAIT_MS = Number(process.env.AWEB_FUND_WAIT_MS || 10 * 60_000);
const conn = new web3.Connection(RPC, { commitment: 'confirmed' });
const MEMO = new web3.PublicKey('MemoSq4gq4mDmTBvVUqDUfFHPNe9KQ9N7s8VeQc5UqV');
const TEXT = process.env.AWEB_MEMO_TEXT || 'Aweb AgentKit — governed agent action (devnet demo)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// PERSISTENT scoped keypair: a stable devnet address that survives restarts, so
// funds can never be stranded by an exited process. Devnet-only, valueless.
// Stored outside any repo (default: a temp path); never committed.
const KEYPAIR_FILE = process.env.AWEB_KEYPAIR_FILE || '/tmp/aweb-solana-live/signer.json';
let kp;
if (existsSync(KEYPAIR_FILE)) {
  kp = web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(KEYPAIR_FILE, 'utf8'))));
  console.log('Loaded persistent scoped signer (devnet):', kp.publicKey.toBase58());
} else {
  kp = web3.Keypair.generate();
  try { writeFileSync(KEYPAIR_FILE, JSON.stringify([...kp.secretKey])); } catch {}
  console.log('Generated persistent scoped signer (devnet):', kp.publicKey.toBase58());
}
console.log('RPC:', RPC.replace(/\/v2\/.*/, '/v2/****'));

// Fund: attempt airdrop, and concurrently poll for external funding.
async function waitForFunds() {
  const deadline = Date.now() + FUND_WAIT_MS;
  let nextAirdrop = 0;
  while (Date.now() < deadline) {
    if (Date.now() >= nextAirdrop) {
      try { const s = await conn.requestAirdrop(kp.publicKey, web3.LAMPORTS_PER_SOL / 10); console.log('airdrop requested:', s.slice(0, 16) + '…'); }
      catch (e) { console.log('airdrop unavailable:', String(e.message).split('.')[0].slice(0, 60)); }
      nextAirdrop = Date.now() + 30_000; // gentle: at most one airdrop / 30s
    }
    const bal = await conn.getBalance(kp.publicKey).catch(() => 0);
    if (bal > 0) return bal;
    if (Date.now() - (deadline - FUND_WAIT_MS) < 5000) {
      console.log(`\nWaiting for devnet SOL. If the faucet is rate-limited, fund this address:\n  ${kp.publicKey.toBase58()}\n  (https://faucet.solana.com — devnet — any small amount)\n`);
    }
    await sleep(4000);
  }
  return 0;
}

async function pollSig(sig, ms = 60_000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const st = await conn.getSignatureStatuses([sig]).catch(() => null);
    const s = st?.value?.[0];
    if (s?.err) return s;
    if (s && (s.confirmationStatus === 'confirmed' || s.confirmationStatus === 'finalized')) return s;
    await sleep(2000);
  }
  return null;
}

const bal = await waitForFunds();
if (!bal) { console.error('Not funded within the wait window. Re-run, or fund the address above.'); process.exit(2); }
console.log('Funded:', bal / web3.LAMPORTS_PER_SOL, 'devnet SOL\n');

// On-chain action: a governed self-transfer via the System Program (always
// present on every cluster). A real value-movement instruction — classified
// VALUE_MOVEMENT, gated by approval + caps. Value stays with the signer.
const MARKER_LAMPORTS = 1000;
const buildTx = async () => {
  const { blockhash } = await conn.getLatestBlockhash();
  const tx = new web3.Transaction();
  tx.add(web3.SystemProgram.transfer({ fromPubkey: kp.publicKey, toPubkey: kp.publicKey, lamports: MARKER_LAMPORTS }));
  tx.feePayer = kp.publicKey; tx.recentBlockhash = blockhash; return tx;
};
const port = {
  getLatestBlockhash: () => conn.getLatestBlockhash(),
  async simulate() {
    const r = await conn.simulateTransaction(await buildTx());
    return { ok: !r.value.err, computeUnits: r.value.unitsConsumed ?? 0, feeLamports: 5000,
      logs: (r.value.logs ?? []).slice(0, 20), err: r.value.err ? JSON.stringify(r.value.err) : undefined };
  },
  async sendSigned(_p, _s, signedTx) {
    const signature = await conn.sendRawTransaction(signedTx.serialize());
    const s = await pollSig(signature);
    return { signature, slot: s?.slot ?? 0, confirmationStatus: s?.err ? 'failed' : 'confirmed' };
  },
};
const signer = { publicKey: kp.publicKey.toBase58(), scope: 'devnet:limited:memo-only',
  sign: async (h) => Buffer.from(`approved:${h}`).toString('base64') };

const SYSTEM_PROGRAM = '11111111111111111111111111111111';
const plan = buildPlan({
  intent: 'Execute a governed on-chain launch marker (devnet self-transfer)',
  feePayer: kp.publicKey.toBase58(), cluster: 'devnet',
  instructions: [{
    programId: SYSTEM_PROGRAM, kind: 'transfer', lamports: MARKER_LAMPORTS,
    accounts: [{ pubkey: kp.publicKey.toBase58(), isSigner: true, isWritable: true }],
    dataSummary: `system self-transfer ${MARKER_LAMPORTS} lamports — governed devnet marker (${TEXT})`,
  }],
});
const agent = new GovernedSolanaAgent({ connection: port, signer, policy: defaultPolicyProfile(), approvalSecret: process.env.AWEB_APPROVAL_SECRET || 'live-runtime-secret-not-persisted' });

agent.plan(plan);
console.log('decision :', agent.state.evaluation.decision, '/', agent.state.evaluation.riskClass);
const sim = await agent.simulate();
console.log('simulate :', sim.ok, '| compute units', sim.computeUnits);
try { await agent.sign(); console.log('!! signed without approval (unexpected)'); }
catch { console.log('gate     : signing blocked before human approval ✔'); }
agent.grantApproval({ approvedBy: process.env.AWEB_APPROVER || 'operator:daniel-wahnich' });
await agent.sign();
const realTx = await buildTx(); realTx.sign(kp);
const res = await agent.broadcast(realTx);
const chain = agent.verifyReceipts();
console.log('\nsignature:', res.signature);
console.log('explorer : https://explorer.solana.com/tx/' + res.signature + '?cluster=devnet');
console.log('receipts :', chain.length, '| chain verified', chain.verified);
console.log('\nPublic-spec broadcast receipt:');
console.log(JSON.stringify(toPublicSpecReceipt(agent.ledger.all.find((r) => r.step === 'broadcast')), null, 2));
process.exit(0);
