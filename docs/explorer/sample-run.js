window.AWEB_SAMPLE_RUN = {
  "_note": "Deterministic offline demo run from @aweb-labs/solana-agent-kit. Mock signature/slot; not live chain data.",
  "chain_verified": true,
  "receipt_count": 5,
  "receipts": [
    {
      "receipt_version": "aweb.agent_receipt.v0.1",
      "receipt_id": "aweb-solana-plan-001",
      "created_at": "2025-10-09T08:53:22.000Z",
      "scope": "solana_action_review",
      "step": "plan",
      "authority": {
        "grant_id": "grant.solana.simulate_only",
        "mode": "simulate",
        "authorized_by": "policy:simulate_default",
        "policy_profile": "devnet.needs_approval",
        "allowed_actions": [
          "simulate_transaction",
          "request_human_approval"
        ],
        "denied_actions": [
          "extract_private_key_or_seed",
          "move_user_funds",
          "front_run_or_sandwich",
          "spam_rpc"
        ]
      },
      "agent": {
        "agent_id": "aweb.solana.governed_agent",
        "model_class": "reasoning_agent",
        "operator": "Aweb Labs"
      },
      "workflow": {
        "workflow_id": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
        "intent": "Launch Aweb Demo: on-chain launch marker + small account seed",
        "environment": "testnet",
        "network": "solana-devnet"
      },
      "capability": {
        "provider": "solana",
        "tool": "governed_agent_kit",
        "category": "program_action_evidence",
        "risk_class": "VALUE_MOVEMENT"
      },
      "policy_decision": "needs_approval",
      "approval": {
        "required": false,
        "state": "not_required"
      },
      "execution": {
        "status": "prepared",
        "started_at": "2025-10-09T08:53:21.000Z",
        "finished_at": "2025-10-09T08:53:22.000Z",
        "idempotency_key": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-.plan",
        "cost": {
          "amount": 0,
          "unit": "USD",
          "fee_lamports": 0,
          "note": "no broadcast; no fee incurred"
        },
        "simulation_status": "not_simulated"
      },
      "evidence": {
        "summary": "Agent plan step (prepared) for a memo+transfer transaction on solana-devnet; no broadcast.",
        "solana_context": {
          "cluster": "devnet",
          "fee_payer": "SESSdevnetScopedSignerPublicKeyPlaceholder1",
          "instruction_classes": [
            "memo",
            "transfer"
          ],
          "program_ids": [
            "MemoSq4gq4mDmTBvV0EQ2sQ6yJpL9wXqL4n7z8aB3cD",
            "11111111111111111111111111111111"
          ],
          "compute_units": null,
          "transaction_signature": null,
          "slot": null,
          "broadcast": false,
          "explorer_url": null
        },
        "artifacts": [
          {
            "type": "transaction_plan",
            "ref": "plan://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          }
        ]
      },
      "failure": null,
      "recovery": null,
      "privacy": {
        "redaction_policy": "no_keys_no_seeds_no_tokens_in_receipt",
        "redacted_fields": [
          "feePayer_private_key",
          "session_signer_secret",
          "rpc_auth"
        ]
      },
      "review": {
        "trust_state": "review_pending",
        "human_review_required": true,
        "review_notes": [
          "broadcast requires explicit, scoped, human-approved grant (simulate-by-default)"
        ]
      },
      "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
      "receipt_hash": "df30b4ff83605303501e9b728ea3098b47e038d66c2bf12337bb90eda70f6df3"
    },
    {
      "receipt_version": "aweb.agent_receipt.v0.1",
      "receipt_id": "aweb-solana-simulate-002",
      "created_at": "2025-10-09T08:53:24.000Z",
      "scope": "solana_action_review",
      "step": "simulate",
      "authority": {
        "grant_id": "grant.solana.simulate_only",
        "mode": "simulate",
        "authorized_by": "policy:simulate_default",
        "policy_profile": "devnet.needs_approval",
        "allowed_actions": [
          "simulate_transaction",
          "request_human_approval"
        ],
        "denied_actions": [
          "extract_private_key_or_seed",
          "move_user_funds",
          "front_run_or_sandwich",
          "spam_rpc"
        ]
      },
      "agent": {
        "agent_id": "aweb.solana.governed_agent",
        "model_class": "reasoning_agent",
        "operator": "Aweb Labs"
      },
      "workflow": {
        "workflow_id": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
        "intent": "Launch Aweb Demo: on-chain launch marker + small account seed",
        "environment": "testnet",
        "network": "solana-devnet"
      },
      "capability": {
        "provider": "solana",
        "tool": "governed_agent_kit",
        "category": "program_action_evidence",
        "risk_class": "VALUE_MOVEMENT"
      },
      "policy_decision": "needs_approval",
      "approval": {
        "required": false,
        "state": "not_required"
      },
      "execution": {
        "status": "needs_human_review",
        "started_at": "2025-10-09T08:53:23.000Z",
        "finished_at": "2025-10-09T08:53:24.000Z",
        "idempotency_key": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-.simulate",
        "cost": {
          "amount": 0,
          "unit": "USD",
          "fee_lamports": 0,
          "note": "no broadcast; no fee incurred"
        },
        "simulation_status": "simulated_ok"
      },
      "evidence": {
        "summary": "Agent simulate step (needs_human_review) for a memo+transfer transaction on solana-devnet; no broadcast.",
        "solana_context": {
          "cluster": "devnet",
          "fee_payer": "SESSdevnetScopedSignerPublicKeyPlaceholder1",
          "instruction_classes": [
            "memo",
            "transfer"
          ],
          "program_ids": [
            "MemoSq4gq4mDmTBvV0EQ2sQ6yJpL9wXqL4n7z8aB3cD",
            "11111111111111111111111111111111"
          ],
          "compute_units": 7400,
          "transaction_signature": null,
          "slot": null,
          "broadcast": false,
          "explorer_url": null
        },
        "artifacts": [
          {
            "type": "transaction_plan",
            "ref": "plan://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          },
          {
            "type": "simulation_logs",
            "ref": "sim://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          }
        ]
      },
      "failure": null,
      "recovery": null,
      "privacy": {
        "redaction_policy": "no_keys_no_seeds_no_tokens_in_receipt",
        "redacted_fields": [
          "feePayer_private_key",
          "session_signer_secret",
          "rpc_auth"
        ]
      },
      "review": {
        "trust_state": "review_pending",
        "human_review_required": true,
        "review_notes": [
          "broadcast requires explicit, scoped, human-approved grant (simulate-by-default)"
        ]
      },
      "previous_hash": "df30b4ff83605303501e9b728ea3098b47e038d66c2bf12337bb90eda70f6df3",
      "receipt_hash": "0dddf2869c95a4519de32a3c38ad2936effb9fec8c5baae7e58475c33d9d13a2"
    },
    {
      "receipt_version": "aweb.agent_receipt.v0.1",
      "receipt_id": "aweb-solana-approval-003",
      "created_at": "2025-10-09T08:53:27.000Z",
      "scope": "solana_action_review",
      "step": "await_approval",
      "authority": {
        "grant_id": "grant.solana.8670ff7368d4",
        "mode": "prepare",
        "authorized_by": "operator:daniel-wahnich",
        "policy_profile": "devnet.needs_approval",
        "allowed_actions": [
          "simulate_transaction",
          "request_human_approval"
        ],
        "denied_actions": [
          "extract_private_key_or_seed",
          "move_user_funds",
          "front_run_or_sandwich",
          "spam_rpc"
        ]
      },
      "agent": {
        "agent_id": "aweb.solana.governed_agent",
        "model_class": "reasoning_agent",
        "operator": "Aweb Labs"
      },
      "workflow": {
        "workflow_id": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
        "intent": "Launch Aweb Demo: on-chain launch marker + small account seed",
        "environment": "testnet",
        "network": "solana-devnet"
      },
      "capability": {
        "provider": "solana",
        "tool": "governed_agent_kit",
        "category": "program_action_evidence",
        "risk_class": "VALUE_MOVEMENT"
      },
      "policy_decision": "needs_approval",
      "approval": {
        "required": true,
        "state": "approved",
        "approved_by": "operator:daniel-wahnich",
        "token_digest": "[REDACTED]"
      },
      "execution": {
        "status": "prepared",
        "started_at": "2025-10-09T08:53:26.000Z",
        "finished_at": "2025-10-09T08:53:27.000Z",
        "idempotency_key": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-.await_approval",
        "cost": {
          "amount": 0,
          "unit": "USD",
          "fee_lamports": 0,
          "note": "no broadcast; no fee incurred"
        },
        "simulation_status": "simulated_ok"
      },
      "evidence": {
        "summary": "Agent await_approval step (prepared) for a memo+transfer transaction on solana-devnet; no broadcast.",
        "solana_context": {
          "cluster": "devnet",
          "fee_payer": "SESSdevnetScopedSignerPublicKeyPlaceholder1",
          "instruction_classes": [
            "memo",
            "transfer"
          ],
          "program_ids": [
            "MemoSq4gq4mDmTBvV0EQ2sQ6yJpL9wXqL4n7z8aB3cD",
            "11111111111111111111111111111111"
          ],
          "compute_units": 7400,
          "transaction_signature": null,
          "slot": null,
          "broadcast": false,
          "explorer_url": null
        },
        "artifacts": [
          {
            "type": "transaction_plan",
            "ref": "plan://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          },
          {
            "type": "simulation_logs",
            "ref": "sim://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          }
        ]
      },
      "failure": null,
      "recovery": null,
      "privacy": {
        "redaction_policy": "no_keys_no_seeds_no_tokens_in_receipt",
        "redacted_fields": [
          "feePayer_private_key",
          "session_signer_secret",
          "rpc_auth"
        ]
      },
      "review": {
        "trust_state": "review_pending",
        "human_review_required": false,
        "review_notes": [
          "broadcast requires explicit, scoped, human-approved grant (simulate-by-default)"
        ]
      },
      "previous_hash": "0dddf2869c95a4519de32a3c38ad2936effb9fec8c5baae7e58475c33d9d13a2",
      "receipt_hash": "0908a7e89443ec7637fdd9bebe5e8f608e835826f3fb0fefee82e25d1bc5cb29"
    },
    {
      "receipt_version": "aweb.agent_receipt.v0.1",
      "receipt_id": "aweb-solana-sign-004",
      "created_at": "2025-10-09T08:53:30.000Z",
      "scope": "solana_action_review",
      "step": "sign",
      "authority": {
        "grant_id": "grant.solana.8670ff7368d4",
        "mode": "prepare",
        "authorized_by": "operator:daniel-wahnich",
        "policy_profile": "devnet.needs_approval",
        "allowed_actions": [
          "simulate_transaction",
          "request_human_approval"
        ],
        "denied_actions": [
          "extract_private_key_or_seed",
          "move_user_funds",
          "front_run_or_sandwich",
          "spam_rpc"
        ]
      },
      "agent": {
        "agent_id": "aweb.solana.governed_agent",
        "model_class": "reasoning_agent",
        "operator": "Aweb Labs"
      },
      "workflow": {
        "workflow_id": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
        "intent": "Launch Aweb Demo: on-chain launch marker + small account seed",
        "environment": "testnet",
        "network": "solana-devnet"
      },
      "capability": {
        "provider": "solana",
        "tool": "governed_agent_kit",
        "category": "program_action_evidence",
        "risk_class": "VALUE_MOVEMENT"
      },
      "policy_decision": "needs_approval",
      "approval": {
        "required": true,
        "state": "approved",
        "approved_by": "operator:daniel-wahnich",
        "token_digest": "[REDACTED]"
      },
      "execution": {
        "status": "prepared",
        "started_at": "2025-10-09T08:53:29.000Z",
        "finished_at": "2025-10-09T08:53:30.000Z",
        "idempotency_key": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-.sign",
        "cost": {
          "amount": 0,
          "unit": "USD",
          "fee_lamports": 0,
          "note": "no broadcast; no fee incurred"
        },
        "simulation_status": "simulated_ok"
      },
      "evidence": {
        "summary": "Agent sign step (prepared) for a memo+transfer transaction on solana-devnet; no broadcast.",
        "solana_context": {
          "cluster": "devnet",
          "fee_payer": "SESSdevnetScopedSignerPublicKeyPlaceholder1",
          "instruction_classes": [
            "memo",
            "transfer"
          ],
          "program_ids": [
            "MemoSq4gq4mDmTBvV0EQ2sQ6yJpL9wXqL4n7z8aB3cD",
            "11111111111111111111111111111111"
          ],
          "compute_units": 7400,
          "transaction_signature": null,
          "slot": null,
          "broadcast": false,
          "explorer_url": null
        },
        "artifacts": [
          {
            "type": "transaction_plan",
            "ref": "plan://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          },
          {
            "type": "simulation_logs",
            "ref": "sim://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          }
        ]
      },
      "failure": null,
      "recovery": null,
      "privacy": {
        "redaction_policy": "no_keys_no_seeds_no_tokens_in_receipt",
        "redacted_fields": [
          "feePayer_private_key",
          "session_signer_secret",
          "rpc_auth"
        ]
      },
      "review": {
        "trust_state": "review_pending",
        "human_review_required": false,
        "review_notes": [
          "broadcast requires explicit, scoped, human-approved grant (simulate-by-default)"
        ]
      },
      "previous_hash": "0908a7e89443ec7637fdd9bebe5e8f608e835826f3fb0fefee82e25d1bc5cb29",
      "receipt_hash": "81b89ebf02465927360323ccb96f220e36068a7a0a561e92dade9142d9bcb370"
    },
    {
      "receipt_version": "aweb.agent_receipt.v0.1",
      "receipt_id": "aweb-solana-broadcast-005",
      "created_at": "2025-10-09T08:53:32.000Z",
      "scope": "solana_action_review",
      "step": "broadcast",
      "authority": {
        "grant_id": "grant.solana.8670ff7368d4",
        "mode": "execute_with_human_approval",
        "authorized_by": "operator:daniel-wahnich",
        "policy_profile": "devnet.needs_approval",
        "allowed_actions": [
          "simulate_transaction",
          "request_human_approval"
        ],
        "denied_actions": [
          "extract_private_key_or_seed",
          "move_user_funds",
          "front_run_or_sandwich",
          "spam_rpc"
        ]
      },
      "agent": {
        "agent_id": "aweb.solana.governed_agent",
        "model_class": "reasoning_agent",
        "operator": "Aweb Labs"
      },
      "workflow": {
        "workflow_id": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
        "intent": "Launch Aweb Demo: on-chain launch marker + small account seed",
        "environment": "testnet",
        "network": "solana-devnet"
      },
      "capability": {
        "provider": "solana",
        "tool": "governed_agent_kit",
        "category": "program_action_evidence",
        "risk_class": "VALUE_MOVEMENT"
      },
      "policy_decision": "needs_approval",
      "approval": {
        "required": true,
        "state": "approved",
        "approved_by": "operator:daniel-wahnich",
        "token_digest": "[REDACTED]"
      },
      "execution": {
        "status": "succeeded",
        "started_at": "2025-10-09T08:53:31.000Z",
        "finished_at": "2025-10-09T08:53:32.000Z",
        "idempotency_key": "wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-.broadcast",
        "cost": {
          "amount": 0,
          "unit": "USD",
          "fee_lamports": 10000,
          "note": "devnet fees only; no real value moved"
        },
        "simulation_status": "simulated_ok"
      },
      "evidence": {
        "summary": "Agent broadcast a governed memo+transfer transaction on solana-devnet after human approval; signature recorded.",
        "solana_context": {
          "cluster": "devnet",
          "fee_payer": "SESSdevnetScopedSignerPublicKeyPlaceholder1",
          "instruction_classes": [
            "memo",
            "transfer"
          ],
          "program_ids": [
            "MemoSq4gq4mDmTBvV0EQ2sQ6yJpL9wXqL4n7z8aB3cD",
            "11111111111111111111111111111111"
          ],
          "compute_units": 7400,
          "transaction_signature": "MOCK3bcd6577f48650d540a54bc52204e64521a72cf93ad7a8d43d46aa07f9a8f79c",
          "slot": 250000001,
          "broadcast": true,
          "explorer_url": "https://explorer.solana.com/tx/MOCK3bcd6577f48650d540a54bc52204e64521a72cf93ad7a8d43d46aa07f9a8f79c?cluster=devnet"
        },
        "artifacts": [
          {
            "type": "transaction_plan",
            "ref": "plan://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          },
          {
            "type": "simulation_logs",
            "ref": "sim://wf.solana.devnet.launch-aweb-demo-on-chain-launch-marker-",
            "redacted": false
          }
        ]
      },
      "failure": null,
      "recovery": null,
      "privacy": {
        "redaction_policy": "no_keys_no_seeds_no_tokens_in_receipt",
        "redacted_fields": [
          "feePayer_private_key",
          "session_signer_secret",
          "rpc_auth"
        ]
      },
      "review": {
        "trust_state": "executed_with_approval",
        "human_review_required": false,
        "review_notes": [
          "broadcast requires explicit, scoped, human-approved grant (simulate-by-default)"
        ]
      },
      "previous_hash": "81b89ebf02465927360323ccb96f220e36068a7a0a561e92dade9142d9bcb370",
      "receipt_hash": "0b1b78316cbdeb01f5b97213b82831fb6e091d7ef4c11dd63842912fb6d0cc0a"
    }
  ]
};
