// Aweb Solana AgentKit — governance invariant tests.
// Pure node:test, zero install, zero network. Proves the safety properties a
// grant reviewer cares about: no signing without approval, replay protection,
// value caps, denied instructions, simulate-by-default, and receipt integrity.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  GovernedSolanaAgent,
  GovernanceError,
  Lifecycle,
  MockSolanaConnection,
  MockSessionSigner,
  buildPlan,
  defaultPolicyProfile,
  evaluatePlan,
  Decision,
  RiskClass,
  classifyTransaction,
  issueApprovalToken,
  verifyApprovalToken,
  NonceStore,
  ReceiptLedger,
  toPublicSpecReceipt,
  MEMO_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from '../src/index.mjs';

const clock = () => {
  let t = 1_700_000_000_000;
  return () => (t += 1000);
};

function newAgent(policy) {
  return new GovernedSolanaAgent({
    connection: new MockSolanaConnection(),
    signer: new MockSessionSigner(),
    policy: policy ?? defaultPolicyProfile(),
    approvalSecret: 'test-secret',
    now: clock(),
  });
}

function memoTransferPlan() {
  return buildPlan({
    intent: 'test launch',
    feePayer: 'MOCKSESSfeepayer',
    cluster: 'devnet',
    instructions: [
      { programId: MEMO_PROGRAM_ID, kind: 'memo', accounts: [], dataSummary: 'memo: hi' },
      {
        programId: SYSTEM_PROGRAM_ID,
        kind: 'transfer',
        lamports: 1_000_000,
        accounts: [],
        dataSummary: 'transfer 0.001 SOL',
      },
    ],
  });
}

test('classifies a transfer transaction as value-movement risk', () => {
  assert.equal(classifyTransaction(memoTransferPlan()), RiskClass.VALUE_MOVEMENT);
});

test('policy requires approval before broadcast (simulate-by-default)', () => {
  const evalr = evaluatePlan(memoTransferPlan(), defaultPolicyProfile());
  assert.equal(evalr.decision, Decision.NEEDS_APPROVAL);
});

test('mainnet broadcast is denied by default', () => {
  const plan = { ...memoTransferPlan(), cluster: 'mainnet-beta' };
  const evalr = evaluatePlan(plan, defaultPolicyProfile());
  assert.equal(evalr.decision, Decision.DENY);
});

test('value over cap is downgraded to simulate-only', () => {
  const plan = buildPlan({
    intent: 'too big',
    feePayer: 'x',
    cluster: 'devnet',
    instructions: [{ programId: SYSTEM_PROGRAM_ID, kind: 'transfer', lamports: 999_000_000, accounts: [], dataSummary: 'big' }],
  });
  const evalr = evaluatePlan(plan, defaultPolicyProfile());
  assert.equal(evalr.decision, Decision.SIMULATE_ONLY);
});

test('denied instruction kinds are blocked outright', () => {
  const plan = buildPlan({
    intent: 'authority grab',
    feePayer: 'x',
    cluster: 'devnet',
    instructions: [{ programId: SYSTEM_PROGRAM_ID, kind: 'set_authority', accounts: [], dataSummary: 'set_authority' }],
  });
  const evalr = evaluatePlan(plan, defaultPolicyProfile());
  assert.equal(evalr.decision, Decision.DENY);
});

test('INVARIANT: signing is impossible without a human-approved grant', async () => {
  const agent = newAgent();
  agent.plan(memoTransferPlan());
  await agent.simulate();
  assert.equal(agent.state.lifecycle, Lifecycle.AWAITING_APPROVAL);
  await assert.rejects(() => agent.sign(), GovernanceError);
});

test('INVARIANT: full happy path reaches CONFIRMED with a signature', async () => {
  const agent = newAgent();
  agent.plan(memoTransferPlan());
  await agent.simulate();
  agent.grantApproval({ approvedBy: 'operator:test' });
  await agent.sign();
  const result = await agent.broadcast();
  assert.equal(agent.state.lifecycle, Lifecycle.CONFIRMED);
  assert.match(result.signature, /^MOCK/);
  assert.ok(result.slot > 0);
});

test('INVARIANT: an approval token is single-use (anti-replay)', async () => {
  const agent = newAgent();
  agent.plan(memoTransferPlan());
  await agent.simulate();
  agent.grantApproval({ approvedBy: 'operator:test' });
  await agent.sign(); // consumes the nonce
  await agent.broadcast();
  // Force lifecycle back and attempt to reuse the same token.
  agent.state.lifecycle = Lifecycle.APPROVED;
  await assert.rejects(() => agent.sign(), /replay|invalid/);
});

test('approval token is bound to its plan hash (cannot be moved to another plan)', () => {
  const now = clock();
  const nonceStore = new NonceStore();
  const token = issueApprovalToken(
    { action: 'solana.broadcast', riskClass: RiskClass.VALUE_MOVEMENT, planHash: 'aaa', approvedBy: 'op', ttlMs: 60_000, now: now() },
    'secret',
  );
  const ok = verifyApprovalToken(token, 'secret', { planHash: 'aaa', now: now(), nonceStore });
  assert.equal(ok.valid, true);
  const moved = verifyApprovalToken(token, 'secret', { planHash: 'bbb', now: now(), nonceStore: new NonceStore() });
  assert.equal(moved.valid, false);
  assert.match(moved.reason, /not bound/);
});

test('approval token expires', () => {
  const token = issueApprovalToken(
    { action: 'a', riskClass: RiskClass.WRITE, planHash: 'p', approvedBy: 'op', ttlMs: 1000, now: 1000 },
    'secret',
  );
  const res = verifyApprovalToken(token, 'secret', { planHash: 'p', now: 999_999, nonceStore: new NonceStore() });
  assert.equal(res.valid, false);
  assert.match(res.reason, /expired/);
});

test('tampered approval signature is rejected', () => {
  const token = issueApprovalToken(
    { action: 'a', riskClass: RiskClass.WRITE, planHash: 'p', approvedBy: 'op', ttlMs: 60_000, now: 1000 },
    'secret',
  );
  token.signature = token.signature.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a'));
  const res = verifyApprovalToken(token, 'secret', { planHash: 'p', now: 2000, nonceStore: new NonceStore() });
  assert.equal(res.valid, false);
});

test('INVARIANT: simulation failure halts the lifecycle (no broadcast)', async () => {
  const agent = newAgent();
  const plan = buildPlan({
    intent: 'bad',
    feePayer: 'x',
    cluster: 'devnet',
    instructions: [{ programId: MEMO_PROGRAM_ID, kind: '__force_sim_fail__', accounts: [], dataSummary: 'boom' }],
  });
  agent.plan(plan);
  const sim = await agent.simulate();
  assert.equal(sim.ok, false);
  assert.equal(agent.state.lifecycle, Lifecycle.FAILED);
  // grantApproval is synchronous; a failed simulation must block it outright.
  assert.throws(() => agent.grantApproval({ approvedBy: 'op' }), GovernanceError);
});

test('INVARIANT: receipts form a verifiable hash chain', async () => {
  const agent = newAgent();
  agent.plan(memoTransferPlan());
  await agent.simulate();
  agent.grantApproval({ approvedBy: 'operator:test' });
  await agent.sign();
  await agent.broadcast();
  const chain = agent.verifyReceipts();
  assert.equal(chain.verified, true);
  assert.ok(chain.length >= 4);
});

test('tampering with a receipt body breaks chain verification', () => {
  const ledger = new ReceiptLedger();
  ledger.append({ receipt_id: 'r1', scope: 'solana_action_review', data: 'a' });
  ledger.append({ receipt_id: 'r2', scope: 'solana_action_review', data: 'b' });
  assert.equal(ledger.verify().verified, true);
  // The sealed receipts returned by .all are the live objects; mutate one body
  // field without recomputing its hash — verification must catch it.
  const receipts = ledger.all;
  receipts[0].data = 'tampered';
  const result = ledger.verify();
  assert.equal(result.verified, false);
  assert.equal(result.brokenAt, 0);
});

test('receipts never contain secrets (redaction by design)', async () => {
  const agent = newAgent();
  agent.plan(memoTransferPlan());
  await agent.simulate();
  agent.grantApproval({ approvedBy: 'operator:test' });
  await agent.sign();
  await agent.broadcast();
  const blob = JSON.stringify(agent.ledger.all);
  assert.ok(!blob.includes('test-secret'), 'approval HMAC secret must never appear in receipts');
  // The raw approval signature must not be stored; only a short digest.
  const tokenSig = agent.state.approval.token.signature;
  assert.ok(!blob.includes(tokenSig), 'raw approval signature must not be stored in receipts');
});

test('public-spec receipt conforms to required top-level fields', async () => {
  const agent = newAgent();
  agent.plan(memoTransferPlan());
  await agent.simulate();
  agent.grantApproval({ approvedBy: 'operator:test' });
  await agent.sign();
  await agent.broadcast();
  const pub = toPublicSpecReceipt(agent.ledger.all.find((r) => r.step === 'broadcast'));
  for (const field of ['receipt_version', 'receipt_id', 'example', 'created_at', 'scope', 'authority', 'agent', 'workflow', 'capability', 'execution', 'evidence', 'privacy', 'review']) {
    assert.ok(field in pub, `missing required field ${field}`);
  }
  assert.equal(pub.example, true);
  assert.equal(pub.authority.mode, 'execute_with_human_approval');
});
