// Aweb Solana AgentKit — shared type contracts (JSDoc typedefs).
// Pure documentation module: no runtime exports. Keeps the kit dependency-free
// while giving editors and consumers full type information.

/**
 * @typedef {Object} AccountRef
 * @property {string} pubkey base58 account address
 * @property {boolean} isSigner
 * @property {boolean} isWritable
 */

/**
 * Provider-agnostic instruction. The governance core never imports
 * @solana/web3.js; the live adapter translates these into real instructions.
 * @typedef {Object} Instruction
 * @property {string} programId base58 program address
 * @property {string} kind e.g. 'transfer' | 'mint' | 'memo' | 'program_call' | 'read'
 * @property {number} [lamports] value moved, if any
 * @property {AccountRef[]} accounts
 * @property {string} dataSummary human-readable, redaction-safe summary of the instruction data
 */

/**
 * @typedef {Object} TransactionPlan
 * @property {string} planId
 * @property {'devnet'|'testnet'|'mainnet-beta'} cluster
 * @property {string} feePayer base58 address that pays fees (the scoped session signer)
 * @property {Instruction[]} instructions
 * @property {string} intent natural-language goal this plan serves
 */

/**
 * @typedef {Object} PolicyProfile
 * @property {string} id
 * @property {'devnet'|'testnet'|'mainnet-beta'} cluster
 * @property {boolean} requireApprovalForBroadcast
 * @property {string[]} allowedPrograms broadcast allowlist ([] = simulate any, approval-gated broadcast)
 * @property {string[]} deniedInstructionKinds fail-closed denied authority changes
 * @property {number} maxLamportsPerTransaction value cap
 * @property {boolean} allowMainnet
 */

/**
 * @typedef {Object} PolicyEvaluation
 * @property {'allow'|'simulate_only'|'needs_approval'|'deny'} decision
 * @property {string} riskClass
 * @property {string[]} reasons
 * @property {number} lamports
 */

/**
 * @typedef {Object} ApprovalToken
 * @property {string} action
 * @property {string} riskClass
 * @property {string} planHash
 * @property {string} approvedBy
 * @property {string} nonce
 * @property {number} expiresAt
 * @property {string} signature HMAC-SHA256 over the canonical grant payload
 */

/**
 * @typedef {Object} SimulationResult
 * @property {boolean} ok
 * @property {number} computeUnits
 * @property {number} feeLamports
 * @property {string[]} logs redaction-safe simulation logs
 * @property {string} [err] error string if simulation failed
 */

/**
 * @typedef {Object} BroadcastResult
 * @property {string} signature base58 transaction signature
 * @property {number} slot
 * @property {'confirmed'|'finalized'|'failed'} confirmationStatus
 */

export {}; // ensure ESM module
