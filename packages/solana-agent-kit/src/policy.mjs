// Aweb Solana AgentKit — Policy Engine
// Governed risk classification, allowlists, value caps, and HMAC approval tokens
// with single-use nonce anti-replay. Mirrors the production Aweb Trust Runtime
// (packages/mcp-warehouse/src/policy/*) as an open, self-contained primitive.
//
// Apache-2.0. No secrets, no custody, no key material live here.

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Risk classes, ordered low -> high. A transaction is governed at the level of
 * its highest-risk instruction. Any broadcast is at minimum SIGN_AND_BROADCAST.
 * @readonly
 */
export const RiskClass = Object.freeze({
  READ: 'READ',
  WRITE: 'WRITE',
  SIGN_AND_BROADCAST: 'SIGN_AND_BROADCAST',
  VALUE_MOVEMENT: 'VALUE_MOVEMENT',
});

const RISK_ORDER = [
  RiskClass.READ,
  RiskClass.WRITE,
  RiskClass.SIGN_AND_BROADCAST,
  RiskClass.VALUE_MOVEMENT,
];

/** Decisions the policy engine can return for a step. @readonly */
export const Decision = Object.freeze({
  ALLOW: 'allow', // low risk, may run without explicit human approval
  SIMULATE_ONLY: 'simulate_only', // permitted to simulate, never to broadcast
  NEEDS_APPROVAL: 'needs_approval', // requires a valid approval token + human ok
  DENY: 'deny', // blocked outright
});

/**
 * Map an abstract instruction kind to a risk class. Instruction kinds are
 * intentionally provider-agnostic so the kit does not depend on @solana/web3.js
 * in its governance core.
 * @param {{ kind: string, lamports?: number }} instruction
 * @returns {string} RiskClass
 */
export function classifyInstruction(instruction) {
  switch (instruction.kind) {
    case 'read':
    case 'get_account':
      return RiskClass.READ;
    case 'memo':
    case 'create_account':
    case 'initialize':
    case 'program_call':
      return RiskClass.WRITE;
    case 'transfer':
    case 'mint':
    case 'burn':
    case 'token_transfer':
      return RiskClass.VALUE_MOVEMENT;
    default:
      // Unknown instruction kinds are treated as value-movement risk by default.
      // Fail safe: unrecognized authority is the most dangerous authority.
      return RiskClass.VALUE_MOVEMENT;
  }
}

/**
 * The highest risk class across a transaction plan. Broadcasting always implies
 * at least SIGN_AND_BROADCAST because it consumes the signer's authority.
 * @param {import('./types.mjs').TransactionPlan} plan
 * @returns {string} RiskClass
 */
export function classifyTransaction(plan) {
  let highest = RiskClass.SIGN_AND_BROADCAST; // baseline for any broadcastable tx
  for (const ix of plan.instructions) {
    const r = classifyInstruction(ix);
    if (RISK_ORDER.indexOf(r) > RISK_ORDER.indexOf(highest)) highest = r;
  }
  return highest;
}

/**
 * Default Aweb-organism policy profile: devnet, simulate-by-default, approval
 * required before any broadcast, program allowlist, denied-instruction set,
 * and per-transaction value caps. Callers may override fields explicitly.
 * @returns {import('./types.mjs').PolicyProfile}
 */
export function defaultPolicyProfile(overrides = {}) {
  return {
    id: 'aweb.solana.devnet.simulate_first.approval_gated.v1',
    cluster: 'devnet',
    requireApprovalForBroadcast: true,
    // Empty allowlist means "allow any program in simulate, require approval to
    // broadcast". A non-empty allowlist restricts which programs may broadcast.
    allowedPrograms: [],
    deniedInstructionKinds: ['set_authority', 'close_account', 'delegate', 'approve_unlimited'],
    maxLamportsPerTransaction: 50_000_000, // 0.05 SOL devnet ceiling per action
    allowMainnet: false,
    ...overrides,
  };
}

/**
 * Total lamports a plan would move (sum of value-movement instruction amounts).
 * @param {import('./types.mjs').TransactionPlan} plan
 */
export function totalLamports(plan) {
  return plan.instructions.reduce((sum, ix) => sum + (ix.lamports ?? 0), 0);
}

/**
 * Evaluate a transaction plan against a policy profile. Pure function: returns a
 * structured decision with human-readable reasons. Never throws on policy denial.
 * @param {import('./types.mjs').TransactionPlan} plan
 * @param {import('./types.mjs').PolicyProfile} profile
 * @returns {import('./types.mjs').PolicyEvaluation}
 */
export function evaluatePlan(plan, profile) {
  const reasons = [];
  const riskClass = classifyTransaction(plan);

  // 1. Cluster guard — mainnet is denied unless explicitly enabled.
  if (plan.cluster === 'mainnet-beta' && !profile.allowMainnet) {
    reasons.push('mainnet broadcast is disabled by policy (allowMainnet=false)');
    return { decision: Decision.DENY, riskClass, reasons, lamports: totalLamports(plan) };
  }
  if (plan.cluster !== profile.cluster && !(plan.cluster === 'devnet' && profile.cluster === 'devnet')) {
    if (!(plan.cluster === 'mainnet-beta' && profile.allowMainnet)) {
      reasons.push(`plan cluster ${plan.cluster} does not match policy cluster ${profile.cluster}`);
    }
  }

  // 2. Denied-instruction guard — fail closed on dangerous authority changes.
  const denied = plan.instructions.filter((ix) => profile.deniedInstructionKinds.includes(ix.kind));
  if (denied.length > 0) {
    reasons.push(`instruction kind(s) denied by policy: ${denied.map((d) => d.kind).join(', ')}`);
    return { decision: Decision.DENY, riskClass, reasons, lamports: totalLamports(plan) };
  }

  // 3. Program allowlist — only enforced for broadcast, not simulation.
  if (profile.allowedPrograms.length > 0) {
    const offenders = plan.instructions
      .map((ix) => ix.programId)
      .filter((p) => !profile.allowedPrograms.includes(p));
    if (offenders.length > 0) {
      reasons.push(`program(s) not on broadcast allowlist: ${[...new Set(offenders)].join(', ')}`);
      // Still simulatable, but not broadcastable.
      return { decision: Decision.SIMULATE_ONLY, riskClass, reasons, lamports: totalLamports(plan) };
    }
  }

  // 4. Value cap guard.
  const lamports = totalLamports(plan);
  if (lamports > profile.maxLamportsPerTransaction) {
    reasons.push(
      `value ${lamports} lamports exceeds cap ${profile.maxLamportsPerTransaction}; approval blocked`,
    );
    return { decision: Decision.SIMULATE_ONLY, riskClass, reasons, lamports };
  }

  // 5. Risk-based gate.
  if (riskClass === RiskClass.READ) {
    reasons.push('read-only: no signature required');
    return { decision: Decision.ALLOW, riskClass, reasons, lamports };
  }
  if (profile.requireApprovalForBroadcast) {
    reasons.push('broadcast requires explicit, scoped, human-approved grant (simulate-by-default)');
    return { decision: Decision.NEEDS_APPROVAL, riskClass, reasons, lamports };
  }
  reasons.push('policy permits broadcast without explicit approval (not recommended)');
  return { decision: Decision.ALLOW, riskClass, reasons, lamports };
}

// ---------------------------------------------------------------------------
// Approval tokens — HMAC-SHA256, single-use nonce, TTL. The secret is provided
// by the host at runtime and is NEVER persisted in receipts or logs.
// ---------------------------------------------------------------------------

/**
 * In-memory single-use nonce store. Production swaps this for a durable store
 * (the Aweb Trust Runtime uses approval_nonce_store.ts). Interface is identical.
 */
export class NonceStore {
  #used = new Set();
  has(nonce) {
    return this.#used.has(nonce);
  }
  consume(nonce) {
    if (this.#used.has(nonce)) return false;
    this.#used.add(nonce);
    return true;
  }
}

function canonicalApprovalPayload(grant) {
  // Deterministic, field-ordered serialization so the signature is stable.
  return JSON.stringify({
    action: grant.action,
    riskClass: grant.riskClass,
    planHash: grant.planHash,
    nonce: grant.nonce,
    expiresAt: grant.expiresAt,
    approvedBy: grant.approvedBy,
  });
}

/**
 * Issue an approval token for a specific plan. Binds the approval to the plan
 * hash so a token cannot be replayed against a different transaction.
 * @param {object} args
 * @param {string} args.action e.g. 'solana.broadcast'
 * @param {string} args.riskClass
 * @param {string} args.planHash sha256 of the plan being approved
 * @param {string} args.approvedBy human/operator id granting approval
 * @param {number} args.ttlMs
 * @param {number} args.now epoch ms (injected clock)
 * @param {string} secret runtime-only HMAC secret
 * @returns {import('./types.mjs').ApprovalToken}
 */
export function issueApprovalToken({ action, riskClass, planHash, approvedBy, ttlMs, now }, secret) {
  if (!secret) throw new Error('approval secret is required at runtime');
  const grant = {
    action,
    riskClass,
    planHash,
    approvedBy,
    nonce: randomBytes(16).toString('hex'),
    expiresAt: now + ttlMs,
  };
  const signature = createHmac('sha256', secret).update(canonicalApprovalPayload(grant)).digest('hex');
  return { ...grant, signature };
}

/**
 * Verify an approval token against a plan hash, the runtime secret, the clock,
 * and the nonce store (single-use). Returns a structured result; never throws.
 * @returns {{ valid: boolean, reason?: string }}
 */
export function verifyApprovalToken(token, secret, { planHash, now, nonceStore }) {
  if (!token || !secret) return { valid: false, reason: 'missing token or secret' };
  if (token.planHash !== planHash) return { valid: false, reason: 'token not bound to this plan' };
  if (now > token.expiresAt) return { valid: false, reason: 'token expired' };

  const expected = createHmac('sha256', secret)
    .update(canonicalApprovalPayload(token))
    .digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(token.signature ?? '', 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { valid: false, reason: 'signature mismatch' };
  }
  if (nonceStore.has(token.nonce)) return { valid: false, reason: 'token already used (replay)' };
  if (!nonceStore.consume(token.nonce)) return { valid: false, reason: 'token already used (replay)' };
  return { valid: true };
}
