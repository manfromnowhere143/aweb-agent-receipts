// Aweb Solana AgentKit — Connection Port + adapters
// Hexagonal boundary: the governance core depends only on this port, never on a
// concrete RPC library. MockSolanaConnection makes the whole kit runnable and
// testable with zero install and zero network. createWeb3Connection() wires the
// real @solana/web3.js for live devnet, lazily (only imported when used).
//
// Apache-2.0.

import { createHash } from 'node:crypto';

/**
 * @typedef {Object} SolanaConnectionPort
 * @property {(plan: import('./types.mjs').TransactionPlan) => Promise<import('./types.mjs').SimulationResult>} simulate
 * @property {(plan: import('./types.mjs').TransactionPlan, signature: string) => Promise<import('./types.mjs').BroadcastResult>} sendSigned
 * @property {() => Promise<{ blockhash: string, lastValidBlockHeight: number }>} getLatestBlockhash
 */

/**
 * Deterministic, offline connection for local runs, demos, and tests.
 * Produces stable pseudo-values derived from the plan so output is reproducible.
 * It NEVER touches the network and moves NO real value.
 */
export class MockSolanaConnection {
  /** @param {{ seed?: string }} [opts] */
  constructor(opts = {}) {
    this.seed = opts.seed ?? 'aweb-devnet-mock';
    this._slot = 250_000_000;
  }

  #digest(plan, salt) {
    return createHash('sha256').update(`${this.seed}:${salt}:${plan.planId}`).digest('hex');
  }

  async getLatestBlockhash() {
    return { blockhash: this.#digest({ planId: 'bh' }, 'blockhash').slice(0, 44), lastValidBlockHeight: this._slot + 150 };
  }

  async simulate(plan) {
    // Fail simulation deterministically for plans flagged as malformed, so tests
    // can exercise the failure path without network flakiness.
    const malformed = plan.instructions.some((i) => i.kind === '__force_sim_fail__');
    const computeUnits = 5000 + plan.instructions.length * 1200;
    return {
      ok: !malformed,
      computeUnits,
      feeLamports: 5000 + plan.instructions.filter((i) => i.lamports).length * 5000,
      logs: [
        `Program log: aweb-agent-kit simulate ${plan.instructions.length} ix`,
        ...plan.instructions.map((i) => `Program log: ix ${i.kind} (${i.dataSummary})`),
      ],
      err: malformed ? 'SimulationError: forced failure for test' : undefined,
    };
  }

  async sendSigned(plan, signature) {
    if (!signature) throw new Error('sendSigned called without a signature — governance bypass attempt');
    this._slot += 1;
    // Mock signature is a deterministic base58-ish digest; clearly not a real tx.
    const sig = `MOCK${this.#digest(plan, `send:${signature}`).slice(0, 84)}`;
    return { signature: sig, slot: this._slot, confirmationStatus: 'confirmed' };
  }
}

/**
 * Live devnet/testnet connection backed by @solana/web3.js. Imported lazily so
 * the package has no hard dependency for offline use. The caller supplies a real
 * scoped session signer and a real instruction builder via opts.translate.
 *
 * This is the documented live path; it is intentionally thin. It performs real
 * simulation and broadcast, but still flows through the same kit governance.
 *
 * @param {object} opts
 * @param {string} opts.endpoint e.g. 'https://api.devnet.solana.com'
 * @param {'devnet'|'testnet'} opts.cluster
 * @param {(plan: import('./types.mjs').TransactionPlan, web3: any, signerPublicKey: any) => Promise<any>} opts.translate
 *        builds a web3.js Transaction from the abstract plan (kept out of the
 *        governance core on purpose).
 * @returns {Promise<SolanaConnectionPort>}
 */
export async function createWeb3Connection(opts) {
  let web3;
  try {
    web3 = await import('@solana/web3.js');
  } catch {
    throw new Error(
      'createWeb3Connection requires @solana/web3.js. Install it in your app (npm i @solana/web3.js) ' +
        'or use MockSolanaConnection for offline runs.',
    );
  }
  const connection = new web3.Connection(opts.endpoint, 'confirmed');

  return {
    async getLatestBlockhash() {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      return { blockhash, lastValidBlockHeight };
    },
    async simulate(plan) {
      // translate() must return { transaction, signerPublicKey }
      const { transaction } = await opts.translate(plan, web3, null);
      const sim = await connection.simulateTransaction(transaction);
      const value = sim.value;
      return {
        ok: !value.err,
        computeUnits: value.unitsConsumed ?? 0,
        feeLamports: 5000, // base fee; priority fee added at build time
        logs: (value.logs ?? []).slice(0, 50),
        err: value.err ? JSON.stringify(value.err) : undefined,
      };
    },
    async sendSigned(plan, _signature, signedTx) {
      if (!signedTx) throw new Error('live sendSigned requires the signed transaction');
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      const latest = await connection.getLatestBlockhash();
      const conf = await connection.confirmTransaction(
        { signature, ...latest },
        'confirmed',
      );
      const slot = (await connection.getSignatureStatus(signature)).context?.slot ?? 0;
      return {
        signature,
        slot,
        confirmationStatus: conf.value.err ? 'failed' : 'confirmed',
      };
    },
    _web3: web3,
    _connection: connection,
  };
}
