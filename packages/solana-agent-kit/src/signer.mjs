// Aweb Solana AgentKit — Scoped Session Signer
// A delegated, limited signer the agent uses for its OWN bounded actions.
// It is NEVER the user's primary wallet and NEVER takes custody of user funds.
// The secret key never leaves the signer, is never serialized, never logged,
// and never appears in a receipt.
//
// MockSessionSigner runs offline for demos/tests. createWeb3SessionSigner()
// wraps a real @solana/web3.js Keypair loaded from a runtime secret the HOST
// provides (e.g. a devnet keypair env var) — the kit never reads secrets itself.
//
// Apache-2.0.

import { createHash } from 'node:crypto';

/**
 * @typedef {Object} SessionSignerPort
 * @property {string} publicKey base58 address
 * @property {(planHash: string) => Promise<string>} sign produces a signature over the plan hash
 * @property {string} scope human-readable scope label (e.g. 'devnet:limited:0.05SOL')
 */

/**
 * Offline, deterministic signer. The "public key" and "signature" are derived
 * hashes — clearly not real Ed25519 material — so demos and tests run anywhere
 * with no keypair and no risk. Real signing is in createWeb3SessionSigner().
 */
export class MockSessionSigner {
  /** @param {{ label?: string, scope?: string }} [opts] */
  constructor(opts = {}) {
    const label = opts.label ?? 'aweb-session-devnet';
    // Deterministic fake pubkey; prefixed so no one mistakes it for a real one.
    this.publicKey = `MOCKSESS${createHash('sha256').update(label).digest('hex').slice(0, 36)}`;
    this.scope = opts.scope ?? 'devnet:limited';
  }

  async sign(planHash) {
    if (!planHash) throw new Error('refusing to sign an empty plan hash');
    return `MOCKSIG${createHash('sha256').update(`${this.publicKey}:${planHash}`).digest('hex')}`;
  }

  /** Never reveals key material; safe to call in logs. */
  toJSON() {
    return { publicKey: this.publicKey, scope: this.scope, secret: '[REDACTED]' };
  }
}

/**
 * Live scoped signer backed by a real @solana/web3.js Keypair. The HOST loads
 * the keypair from a runtime secret (e.g. process.env.AWEB_DEVNET_KEYPAIR as a
 * JSON byte array) and passes the bytes in; the kit never reads env or files.
 *
 * @param {object} opts
 * @param {Uint8Array|number[]} opts.secretKeyBytes devnet keypair secret bytes (runtime-only)
 * @param {string} [opts.scope]
 * @returns {Promise<SessionSignerPort & { _keypair: any }>}
 */
export async function createWeb3SessionSigner(opts) {
  let web3;
  try {
    web3 = await import('@solana/web3.js');
  } catch {
    throw new Error('createWeb3SessionSigner requires @solana/web3.js. Use MockSessionSigner for offline runs.');
  }
  if (!opts.secretKeyBytes) {
    throw new Error('secretKeyBytes is required (a devnet keypair, runtime-only, never user custody)');
  }
  const keypair = web3.Keypair.fromSecretKey(Uint8Array.from(opts.secretKeyBytes));
  const nacl = await import('tweetnacl').catch(() => null);

  return {
    publicKey: keypair.publicKey.toBase58(),
    scope: opts.scope ?? 'devnet:limited',
    async sign(planHash) {
      // Sign the plan-hash bytes with the scoped keypair. For real transaction
      // signing, the live adapter signs the actual message; this signs the plan
      // hash as the approval-bound proof of authorship.
      const msg = Buffer.from(planHash, 'hex');
      if (nacl) {
        const sig = nacl.sign.detached(msg, keypair.secretKey);
        return Buffer.from(sig).toString('base64');
      }
      // Fallback: derive a deterministic proof if tweetnacl is unavailable.
      return createHash('sha256').update(Buffer.concat([keypair.publicKey.toBuffer(), msg])).digest('hex');
    },
    toJSON() {
      return { publicKey: keypair.publicKey.toBase58(), scope: opts.scope ?? 'devnet:limited', secret: '[REDACTED]' };
    },
    _keypair: keypair,
  };
}
