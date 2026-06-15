// Aweb Solana AgentKit — Governed Execution Orchestrator
// The lifecycle state machine that turns an agent's intent into a governed,
// receipted, on-chain action:
//
//   PLANNED -> SIMULATED -> AWAITING_APPROVAL -> APPROVED -> SIGNED -> BROADCAST -> CONFIRMED
//                                  \-> REJECTED (no approval / policy deny)
//                                  \-> FAILED   (simulation or broadcast error)
//
// Invariants (enforced, tested):
//   1. Simulate-by-default: no broadcast without a successful simulation.
//   2. Approval-gated signing: signing is impossible without a valid, plan-bound,
//      single-use approval token AND a human grant.
//   3. Receipted: every state transition appends a hash-chained receipt.
//   4. No secrets in receipts; the signer's key never leaves the signer.
//
// Apache-2.0. No custody. Devnet by default.

import { createHash } from 'node:crypto';
import {
  Decision,
  defaultPolicyProfile,
  evaluatePlan,
  issueApprovalToken,
  verifyApprovalToken,
  NonceStore,
} from './policy.mjs';
import { ReceiptLedger, buildStepReceipt, stableStringify } from './receipt.mjs';

export const Lifecycle = Object.freeze({
  PLANNED: 'PLANNED',
  SIMULATED: 'SIMULATED',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
  APPROVED: 'APPROVED',
  SIGNED: 'SIGNED',
  BROADCAST: 'BROADCAST',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
});

/** sha256 of a transaction plan — binds approvals + signatures to exact bytes. */
export function hashPlan(plan) {
  return createHash('sha256').update(stableStringify(plan)).digest('hex');
}

/**
 * GovernedSolanaAgent runs one transaction plan through the full governed
 * lifecycle. It is deterministic given injected ports (connection, signer,
 * clock), so the same run reproduces identical receipts.
 */
export class GovernedSolanaAgent {
  /**
   * @param {object} deps
   * @param {import('./connection.mjs').SolanaConnectionPort} deps.connection
   * @param {import('./signer.mjs').SessionSignerPort} deps.signer
   * @param {import('./types.mjs').PolicyProfile} [deps.policy]
   * @param {() => number} [deps.now] injected clock (epoch ms)
   * @param {NonceStore} [deps.nonceStore]
   * @param {string} deps.approvalSecret runtime-only HMAC secret (never persisted)
   */
  constructor(deps) {
    if (!deps.connection) throw new Error('connection port is required');
    if (!deps.signer) throw new Error('session signer is required');
    if (!deps.approvalSecret) throw new Error('approvalSecret is required at runtime');
    this.connection = deps.connection;
    this.signer = deps.signer;
    this.policy = deps.policy ?? defaultPolicyProfile();
    this.now = deps.now ?? Date.now;
    this.nonceStore = deps.nonceStore ?? new NonceStore();
    this.approvalSecret = deps.approvalSecret;
    this.ledger = new ReceiptLedger();
    this.state = null;
  }

  #seq = 0;
  #receiptId(step) {
    this.#seq += 1;
    return `aweb-solana-${step}-${String(this.#seq).padStart(3, '0')}`;
  }

  #emit(args) {
    const startedAt = args.startedAt ?? this.now();
    const finishedAt = this.now();
    return this.ledger.append(buildStepReceipt({ ...args, startedAt, finishedAt }));
  }

  /**
   * Step 1 — plan. Evaluates policy and records the decision.
   * @param {import('./types.mjs').TransactionPlan} plan
   */
  plan(plan) {
    const evaluation = evaluatePlan(plan, this.policy);
    this.state = {
      lifecycle: evaluation.decision === Decision.DENY ? Lifecycle.REJECTED : Lifecycle.PLANNED,
      plan,
      planHash: hashPlan(plan),
      evaluation,
      simulation: null,
      approval: null,
      signature: null,
      broadcast: null,
    };
    this.#emit({
      receiptId: this.#receiptId('plan'),
      step: 'plan',
      status: evaluation.decision === Decision.DENY ? 'rejected' : 'prepared',
      plan,
      evaluation,
      failure: evaluation.decision === Decision.DENY ? { code: 'policy_denied', reason: evaluation.reasons.join('; '), retryable: false } : null,
    });
    return this.state;
  }

  /** Step 2 — simulate. Required before any broadcast. */
  async simulate() {
    this.#assertState([Lifecycle.PLANNED], 'simulate');
    const sim = await this.connection.simulate(this.state.plan);
    this.state.simulation = sim;
    if (!sim.ok) {
      this.state.lifecycle = Lifecycle.FAILED;
      this.#emit({
        receiptId: this.#receiptId('simulate'),
        step: 'simulate',
        status: 'failed',
        plan: this.state.plan,
        evaluation: this.state.evaluation,
        simulation: sim,
        failure: { code: 'simulation_failed', reason: sim.err ?? 'unknown', retryable: true },
        recovery: { strategy: 'fix_instructions_and_resimulate', retryable: true, next_action: 'revise plan' },
      });
      return sim;
    }
    this.state.lifecycle =
      this.state.evaluation.decision === Decision.NEEDS_APPROVAL ? Lifecycle.AWAITING_APPROVAL : Lifecycle.SIMULATED;
    this.#emit({
      receiptId: this.#receiptId('simulate'),
      step: 'simulate',
      status: this.state.lifecycle === Lifecycle.AWAITING_APPROVAL ? 'needs_human_review' : 'simulated',
      plan: this.state.plan,
      evaluation: this.state.evaluation,
      simulation: sim,
    });
    return sim;
  }

  /**
   * Issue an approval token. In production this is the artifact a human (or a
   * higher-authority operator) signs off on AFTER reviewing the simulated tx.
   * Calling this represents an explicit human grant.
   * @param {{ approvedBy: string, ttlMs?: number }} args
   */
  grantApproval({ approvedBy, ttlMs = 5 * 60_000 }) {
    this.#assertState([Lifecycle.AWAITING_APPROVAL], 'grantApproval');
    if (!approvedBy) throw new Error('approvedBy (the human/operator granting approval) is required');
    const token = issueApprovalToken(
      {
        action: 'solana.broadcast',
        riskClass: this.state.evaluation.riskClass,
        planHash: this.state.planHash,
        approvedBy,
        ttlMs,
        now: this.now(),
      },
      this.approvalSecret,
    );
    this.state.approval = { token, granted: true };
    this.state.lifecycle = Lifecycle.APPROVED;
    this.#emit({
      receiptId: this.#receiptId('approval'),
      step: 'await_approval',
      status: 'prepared',
      plan: this.state.plan,
      evaluation: this.state.evaluation,
      simulation: this.state.simulation,
      approval: this.state.approval,
    });
    return token;
  }

  /**
   * Step 3 — sign. HARD-BLOCKED unless a valid, plan-bound, single-use approval
   * token is present. This is the core safety invariant.
   */
  async sign() {
    if (this.state?.lifecycle !== Lifecycle.APPROVED) {
      throw new GovernanceError(
        `refusing to sign: lifecycle is ${this.state?.lifecycle ?? 'none'}, expected APPROVED. ` +
          'Signing requires an explicit human-approved grant (simulate-by-default).',
      );
    }
    const check = verifyApprovalToken(this.state.approval.token, this.approvalSecret, {
      planHash: this.state.planHash,
      now: this.now(),
      nonceStore: this.nonceStore,
    });
    if (!check.valid) {
      this.state.lifecycle = Lifecycle.REJECTED;
      this.#emit({
        receiptId: this.#receiptId('sign'),
        step: 'sign',
        status: 'rejected',
        plan: this.state.plan,
        evaluation: this.state.evaluation,
        simulation: this.state.simulation,
        approval: { ...this.state.approval, granted: false },
        failure: { code: 'approval_invalid', reason: check.reason, retryable: false },
      });
      throw new GovernanceError(`refusing to sign: approval token invalid (${check.reason})`);
    }
    const signature = await this.signer.sign(this.state.planHash);
    this.state.signature = signature;
    this.state.lifecycle = Lifecycle.SIGNED;
    this.#emit({
      receiptId: this.#receiptId('sign'),
      step: 'sign',
      status: 'prepared',
      plan: this.state.plan,
      evaluation: this.state.evaluation,
      simulation: this.state.simulation,
      approval: this.state.approval,
    });
    return signature;
  }

  /** Step 4 — broadcast + confirm. Only reachable from SIGNED. */
  async broadcast(signedTx) {
    this.#assertState([Lifecycle.SIGNED], 'broadcast');
    try {
      const result = await this.connection.sendSigned(this.state.plan, this.state.signature, signedTx);
      this.state.broadcast = result;
      this.state.lifecycle = result.confirmationStatus === 'failed' ? Lifecycle.FAILED : Lifecycle.CONFIRMED;
      this.#emit({
        receiptId: this.#receiptId('broadcast'),
        step: 'broadcast',
        status: this.state.lifecycle === Lifecycle.CONFIRMED ? 'succeeded' : 'failed',
        plan: this.state.plan,
        evaluation: this.state.evaluation,
        simulation: this.state.simulation,
        approval: this.state.approval,
        broadcast: result,
        failure:
          this.state.lifecycle === Lifecycle.FAILED
            ? { code: 'broadcast_failed', reason: 'confirmation failed', retryable: true }
            : null,
      });
      return result;
    } catch (err) {
      this.state.lifecycle = Lifecycle.FAILED;
      this.#emit({
        receiptId: this.#receiptId('broadcast'),
        step: 'broadcast',
        status: 'failed',
        plan: this.state.plan,
        evaluation: this.state.evaluation,
        simulation: this.state.simulation,
        approval: this.state.approval,
        failure: { code: 'broadcast_error', reason: String(err?.message ?? err), retryable: true },
      });
      throw err;
    }
  }

  /** Verify the full receipt chain produced by this run. */
  verifyReceipts() {
    return this.ledger.verify();
  }

  #assertState(allowed, action) {
    if (!this.state || !allowed.includes(this.state.lifecycle)) {
      throw new GovernanceError(
        `cannot ${action}: lifecycle is ${this.state?.lifecycle ?? 'none'}, expected one of ${allowed.join(', ')}`,
      );
    }
  }
}

/** Raised when a governance invariant is violated. */
export class GovernanceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GovernanceError';
  }
}
