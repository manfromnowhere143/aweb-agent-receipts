// Aweb Solana AgentKit — Receipt Engine
// Hash-chained agent-action receipts for Solana workflows. Mirrors the production
// AgentActionReceipt (apps/web/src/lib/agent-receipts/receipts.ts): SHA-256
// receipt_hash + previous_hash, chain verification, redaction-by-design.
//
// Two surfaces:
//   - the internal rich receipt (the live evidence object), and
//   - toPublicSpecReceipt(): a schema-conforming example fixture for the corpus.
//
// Apache-2.0. Receipts NEVER contain private keys, seeds, tokens, or secrets.

import { createHash } from 'node:crypto';

/** Fields that must never appear verbatim in a receipt. Redacted on ingest. */
const FORBIDDEN_KEYS = ['secret', 'privateKey', 'private_key', 'seed', 'mnemonic', 'token', 'apiKey', 'api_key'];

const GENESIS_HASH = '0'.repeat(64);

/**
 * Deterministically hash a receipt body (everything except the hash fields).
 * @param {object} body
 * @returns {string} hex sha256
 */
export function hashReceiptBody(body) {
  const { receipt_hash, previous_hash, ...rest } = body;
  return createHash('sha256').update(stableStringify(rest)).digest('hex');
}

/** Stable, key-sorted JSON so hashes are reproducible across runs/machines. */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

/**
 * Recursively redact forbidden keys. Defense in depth: even if a caller passes
 * a secret by mistake, it never lands in the receipt.
 */
export function redact(obj) {
  if (Array.isArray(obj)) return obj.map(redact);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (FORBIDDEN_KEYS.some((f) => k.toLowerCase().includes(f.toLowerCase()))) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return obj;
}

/**
 * Append-only, hash-chained receipt ledger. Each receipt links to the previous
 * via previous_hash, forming a tamper-evident chain.
 */
export class ReceiptLedger {
  /** @type {object[]} */
  #receipts = [];

  get all() {
    return [...this.#receipts];
  }

  get head() {
    return this.#receipts[this.#receipts.length - 1] ?? null;
  }

  /**
   * Append a new receipt. Computes previous_hash + receipt_hash automatically.
   * @param {object} receiptBody fields without hash fields
   * @returns {object} the sealed receipt
   */
  append(receiptBody) {
    const previous_hash = this.head ? this.head.receipt_hash : GENESIS_HASH;
    const body = redact({ ...receiptBody, previous_hash });
    const receipt_hash = hashReceiptBody(body);
    const sealed = { ...body, receipt_hash };
    this.#receipts.push(sealed);
    return sealed;
  }

  /**
   * Verify the integrity of the entire chain.
   * @returns {{ verified: boolean, length: number, brokenAt?: number, reason?: string }}
   */
  verify() {
    let expectedPrev = GENESIS_HASH;
    for (let i = 0; i < this.#receipts.length; i++) {
      const r = this.#receipts[i];
      if (r.previous_hash !== expectedPrev) {
        return { verified: false, length: this.#receipts.length, brokenAt: i, reason: 'previous_hash mismatch' };
      }
      if (hashReceiptBody(r) !== r.receipt_hash) {
        return { verified: false, length: this.#receipts.length, brokenAt: i, reason: 'receipt_hash mismatch' };
      }
      expectedPrev = r.receipt_hash;
    }
    return { verified: true, length: this.#receipts.length };
  }
}

/**
 * Build the internal rich receipt body for one lifecycle step.
 * @param {object} args
 */
export function buildStepReceipt({
  receiptId,
  step,
  status,
  plan,
  evaluation,
  approval,
  simulation,
  broadcast,
  startedAt,
  finishedAt,
  failure,
  recovery,
}) {
  return {
    receipt_version: 'aweb.agent_receipt.v0.1',
    receipt_id: receiptId,
    created_at: new Date(finishedAt).toISOString(),
    scope: 'solana_action_review',
    step, // 'plan' | 'simulate' | 'await_approval' | 'sign' | 'broadcast' | 'confirm'
    authority: {
      grant_id: approval?.token?.nonce ? `grant.solana.${approval.token.nonce.slice(0, 12)}` : 'grant.solana.simulate_only',
      mode: status === 'succeeded' && broadcast ? 'execute_with_human_approval' : approval ? 'prepare' : 'simulate',
      authorized_by: approval?.token?.approvedBy ?? 'policy:simulate_default',
      policy_profile: evaluation ? `${plan.cluster}.${evaluation.decision}` : `${plan.cluster}.simulate`,
      allowed_actions: deriveAllowed(evaluation),
      denied_actions: ['extract_private_key_or_seed', 'move_user_funds', 'front_run_or_sandwich', 'spam_rpc'],
    },
    agent: {
      agent_id: 'aweb.solana.governed_agent',
      model_class: 'reasoning_agent',
      operator: 'Aweb Labs',
    },
    workflow: {
      workflow_id: plan.planId,
      intent: plan.intent,
      environment: plan.cluster === 'mainnet-beta' ? 'production' : 'testnet',
      network: `solana-${plan.cluster}`,
    },
    capability: {
      provider: 'solana',
      tool: 'governed_agent_kit',
      category: 'program_action_evidence',
      risk_class: evaluation?.riskClass ?? 'READ',
    },
    policy_decision: evaluation ? evaluation.decision : 'simulate_only',
    approval: approval
      ? {
          required: true,
          state: approval.granted ? 'approved' : 'required',
          approved_by: approval.token?.approvedBy ?? null,
          // NEVER store the HMAC signature itself; store only a short proof digest.
          token_digest: approval.token ? sha256short(approval.token.signature) : null,
        }
      : { required: false, state: 'not_required' },
    execution: {
      status, // prepared | simulated | succeeded | failed | rejected | needs_human_review
      started_at: new Date(startedAt).toISOString(),
      finished_at: new Date(finishedAt).toISOString(),
      idempotency_key: `${plan.planId}.${step}`,
      cost: {
        amount: 0,
        unit: 'USD',
        fee_lamports: broadcast ? simulation?.feeLamports ?? 0 : 0,
        note: broadcast ? 'devnet fees only; no real value moved' : 'no broadcast; no fee incurred',
      },
      simulation_status: simulation
        ? simulation.ok
          ? 'simulated_ok'
          : 'simulation_failed'
        : 'not_simulated',
    },
    evidence: {
      summary: stepSummary(step, status, plan, broadcast),
      solana_context: {
        cluster: plan.cluster,
        fee_payer: plan.feePayer,
        instruction_classes: plan.instructions.map((i) => i.kind),
        program_ids: [...new Set(plan.instructions.map((i) => i.programId))],
        compute_units: simulation?.computeUnits ?? null,
        transaction_signature: broadcast?.signature ?? null,
        slot: broadcast?.slot ?? null,
        broadcast: Boolean(broadcast),
        explorer_url: broadcast?.signature
          ? `https://explorer.solana.com/tx/${broadcast.signature}?cluster=${plan.cluster}`
          : null,
      },
      artifacts: [
        {
          type: 'transaction_plan',
          ref: `plan://${plan.planId}`,
          redacted: false,
        },
        ...(simulation
          ? [{ type: 'simulation_logs', ref: `sim://${plan.planId}`, redacted: false }]
          : []),
      ],
    },
    failure: failure ?? null,
    recovery: recovery ?? null,
    privacy: {
      redaction_policy: 'no_keys_no_seeds_no_tokens_in_receipt',
      redacted_fields: ['feePayer_private_key', 'session_signer_secret', 'rpc_auth'],
    },
    review: {
      trust_state: status === 'succeeded' ? 'executed_with_approval' : status === 'rejected' ? 'blocked' : 'review_pending',
      human_review_required: evaluation?.decision === 'needs_approval' && !approval?.granted,
      review_notes: evaluation?.reasons ?? [],
    },
  };
}

function deriveAllowed(evaluation) {
  if (!evaluation) return ['simulate_transaction'];
  switch (evaluation.decision) {
    case 'allow':
      return ['read_program_context'];
    case 'simulate_only':
      return ['simulate_transaction', 'prepare_reviewer_summary'];
    case 'needs_approval':
      return ['simulate_transaction', 'request_human_approval'];
    default:
      return [];
  }
}

function stepSummary(step, status, plan, broadcast) {
  if (broadcast?.signature) {
    return `Agent broadcast a governed ${plan.instructions.map((i) => i.kind).join('+')} transaction on solana-${plan.cluster} after human approval; signature recorded.`;
  }
  return `Agent ${step} step (${status}) for a ${plan.instructions.map((i) => i.kind).join('+')} transaction on solana-${plan.cluster}; no broadcast.`;
}

function sha256short(input) {
  if (!input) return null;
  return createHash('sha256').update(String(input)).digest('hex').slice(0, 16);
}

/**
 * Render a public-spec-conforming example fixture (example: true) from an
 * internal receipt, for inclusion in the open corpus / validators.
 */
export function toPublicSpecReceipt(internal) {
  return redact({
    receipt_version: 'aweb.agent_receipt.v0.1',
    receipt_id: internal.receipt_id,
    example: true,
    created_at: internal.created_at,
    scope: 'solana_action_review',
    authority: {
      grant_id: internal.authority.grant_id,
      mode: internal.authority.mode === 'execute_with_human_approval' ? 'execute_with_human_approval' : 'simulate',
      authorized_by: internal.authority.authorized_by,
      policy_profile: internal.authority.policy_profile,
      allowed_actions: internal.authority.allowed_actions,
      denied_actions: internal.authority.denied_actions,
    },
    agent: internal.agent,
    workflow: {
      workflow_id: internal.workflow.workflow_id,
      intent: internal.workflow.intent,
      environment: internal.workflow.environment === 'production' ? 'mainnet_read_only' : 'testnet',
    },
    capability: {
      provider: 'solana',
      tool: internal.capability.tool,
      category: internal.capability.category,
    },
    execution: {
      status: internal.execution.status,
      started_at: internal.execution.started_at,
      finished_at: internal.execution.finished_at,
      idempotency_key: internal.execution.idempotency_key,
      cost: { amount: 0, unit: 'USD', note: internal.execution.cost.note },
    },
    evidence: {
      summary: internal.evidence.summary,
      solana_context: internal.evidence.solana_context,
      artifacts: internal.evidence.artifacts.map((a) => ({ ...a, redacted: Boolean(a.redacted) })),
    },
    privacy: internal.privacy,
    review: internal.review,
  });
}
