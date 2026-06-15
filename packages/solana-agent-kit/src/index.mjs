// Aweb Solana AgentKit — public entrypoint.
// Governed AI-agent execution for Solana: plan -> simulate -> approve -> sign ->
// broadcast, with hash-chained receipts and simulate-by-default safety.
//
// Apache-2.0. Devnet-first. No custody. No secrets in receipts.

export {
  GovernedSolanaAgent,
  GovernanceError,
  Lifecycle,
  hashPlan,
} from './kit.mjs';

export {
  RiskClass,
  Decision,
  classifyInstruction,
  classifyTransaction,
  defaultPolicyProfile,
  evaluatePlan,
  totalLamports,
  issueApprovalToken,
  verifyApprovalToken,
  NonceStore,
} from './policy.mjs';

export {
  ReceiptLedger,
  buildStepReceipt,
  toPublicSpecReceipt,
  hashReceiptBody,
  stableStringify,
  redact,
} from './receipt.mjs';

export { MockSolanaConnection, createWeb3Connection } from './connection.mjs';
export { MockSessionSigner, createWeb3SessionSigner } from './signer.mjs';

/**
 * Convenience builder for a Solana transaction plan.
 * @param {object} args
 * @param {string} args.intent
 * @param {string} args.feePayer
 * @param {'devnet'|'testnet'|'mainnet-beta'} [args.cluster]
 * @param {import('./types.mjs').Instruction[]} args.instructions
 * @returns {import('./types.mjs').TransactionPlan}
 */
export function buildPlan({ intent, feePayer, cluster = 'devnet', instructions }) {
  if (!instructions?.length) throw new Error('a plan needs at least one instruction');
  const planId = `wf.solana.${cluster}.${slug(intent)}`;
  return { planId, cluster, feePayer, intent, instructions };
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** The Solana Memo program id (a safe, value-free devnet demo target). */
export const MEMO_PROGRAM_ID = 'MemoSq4gq4mDmTBvV0EQ2sQ6yJpL9wXqL4n7z8aB3cD';
/** The System program id (used for lamport transfers / account creation). */
export const SYSTEM_PROGRAM_ID = '11111111111111111111111111111111';
