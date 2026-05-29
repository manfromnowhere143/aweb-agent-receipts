export const MISSION_CONTRACT_VERSION = 'aweb.mission_contract.v0.1' as const;
export const AGENT_RECEIPT_VERSION = 'aweb.agent_receipt.v0.1' as const;

export type MissionCapabilityMode = 'read' | 'draft' | 'write' | 'send';
export type MissionRiskClass =
  | 'read'
  | 'draft'
  | 'write'
  | 'send'
  | 'spend'
  | 'deploy'
  | 'admin'
  | 'identity'
  | 'legal';

export interface MissionCapability {
  capability_id: string;
  source: 'api_warehouse' | 'mcp_warehouse' | 'internal';
  slug: string;
  provider_id?: string;
  tool_name?: string;
  mode: MissionCapabilityMode;
  risk_class: MissionRiskClass;
  approval_required: boolean;
  evidence_required: boolean;
  credential_boundary_id: string;
  purpose?: string;
}

export interface MissionApprovalGate {
  gate_id: string;
  title: string;
  risk_class: MissionRiskClass | string;
  trigger: string;
  default_decision: 'block';
  blocks_capabilities: string[];
}

export interface MissionContract {
  contract_version: typeof MISSION_CONTRACT_VERSION;
  contract_id: string;
  example: true;
  created_at: string;
  mission: {
    mission_id: string;
    mission_type: string;
    workspace_id: string;
    operator_id: string;
    user_intent: string;
    clarified_business_goal: string;
  };
  success_criteria: string[];
  allowed_capabilities: MissionCapability[];
  credential_boundaries: Array<{
    boundary_id: string;
    label: string;
    provider_ids: string[];
    allowed_scopes: string[];
    denied_scopes: string[];
    secret_handling: 'runtime_only' | 'none';
  }>;
  approval_gates: MissionApprovalGate[];
  evidence_requirements: Array<{
    requirement_id: string;
    title: string;
    applies_to_capability_ids: string[];
    artifact_type: string;
    required: true;
    redaction: 'required' | 'not_required';
  }>;
  execution_policy: Record<string, unknown>;
  recovery_plan: Record<string, unknown>;
  receipt_schema: {
    receipt_type: string;
    required_fields: string[];
    links_to_contract: boolean;
  };
  operational_graph: {
    nodes: Array<{ node_id: string; kind: string; label: string }>;
    edges: Array<{ from: string; to: string; kind: string }>;
  };
}

export interface AgentReceipt {
  receipt_version: typeof AGENT_RECEIPT_VERSION;
  receipt_id: string;
  example: true;
  created_at: string;
  scope: string;
  authority: {
    grant_id: string;
    contract_id?: string;
    mode: 'observe' | 'simulate' | 'prepare' | 'execute_with_human_approval';
    authorized_by: string;
    allowed_actions: string[];
    denied_actions: string[];
    policy_profile?: string;
  };
  agent: {
    agent_id: string;
    model_class: string;
    operator: string;
  };
  workflow: {
    workflow_id: string;
    intent: string;
    environment: 'simulated' | 'testnet' | 'mainnet_read_only' | 'production';
    contract_id?: string;
  };
  capability: {
    provider: string;
    tool: string;
    category: string;
    mcp_provider?: string;
  };
  execution: {
    status: 'prepared' | 'simulated' | 'succeeded' | 'failed' | 'rejected' | 'needs_human_review';
    started_at: string;
    finished_at: string;
    idempotency_key: string;
    cost: {
      amount: number;
      unit: string;
      note?: string;
    };
  };
  evidence: {
    summary: string;
    artifacts: Array<{
      type: string;
      ref: string;
      redacted: boolean;
      reason?: string;
    }>;
  };
  privacy: {
    redaction_policy: string;
    redacted_fields: string[];
    disclosure?: string;
  };
  review: {
    trust_state: string;
    human_review_required: boolean;
    review_notes: string[];
  };
}

export interface ValidationResult {
  ok: boolean;
  issues: string[];
}

const sideEffectingModes = new Set<MissionCapabilityMode>(['write', 'send']);
const gatedRiskClasses = new Set<MissionRiskClass>([
  'write',
  'send',
  'spend',
  'deploy',
  'admin',
  'identity',
  'legal',
]);

export function validateMissionContract(contract: MissionContract): ValidationResult {
  const issues: string[] = [];

  if (contract.contract_version !== MISSION_CONTRACT_VERSION) {
    issues.push('contract_version must be aweb.mission_contract.v0.1');
  }
  if (contract.example !== true) {
    issues.push('public examples must set example=true');
  }
  if (!contract.receipt_schema.links_to_contract) {
    issues.push('receipt_schema.links_to_contract must be true');
  }
  if (!contract.receipt_schema.required_fields.includes('contract_id')) {
    issues.push('receipt_schema.required_fields must include contract_id');
  }

  const boundaryIds = new Set(contract.credential_boundaries.map(boundary => boundary.boundary_id));
  const gatedCapabilityIds = new Set(
    contract.approval_gates.flatMap(gate => gate.blocks_capabilities)
  );
  const evidencedCapabilityIds = new Set(
    contract.evidence_requirements.flatMap(requirement => requirement.applies_to_capability_ids)
  );

  for (const gate of contract.approval_gates) {
    if (gate.default_decision !== 'block') {
      issues.push(`${gate.gate_id} must default to block`);
    }
  }

  for (const capability of contract.allowed_capabilities) {
    if (!boundaryIds.has(capability.credential_boundary_id)) {
      issues.push(`${capability.capability_id} references an unknown credential boundary`);
    }

    const needsGate =
      capability.approval_required ||
      sideEffectingModes.has(capability.mode) ||
      gatedRiskClasses.has(capability.risk_class);

    if (needsGate && !capability.approval_required) {
      issues.push(`${capability.capability_id} has side-effect risk but approval_required is false`);
    }
    if (needsGate && !gatedCapabilityIds.has(capability.capability_id)) {
      issues.push(`${capability.capability_id} has side-effect risk but no approval gate covers it`);
    }
    if (capability.evidence_required && !evidencedCapabilityIds.has(capability.capability_id)) {
      issues.push(`${capability.capability_id} requires evidence but no evidence rule covers it`);
    }
  }

  return { ok: issues.length === 0, issues };
}

export function validateAgentReceipt(receipt: AgentReceipt): ValidationResult {
  const issues: string[] = [];

  if (receipt.receipt_version !== AGENT_RECEIPT_VERSION) {
    issues.push('receipt_version must be aweb.agent_receipt.v0.1');
  }
  if (receipt.example !== true) {
    issues.push('public examples must set example=true');
  }
  if (!Array.isArray(receipt.authority.allowed_actions) || receipt.authority.allowed_actions.length === 0) {
    issues.push('authority.allowed_actions must be non-empty');
  }
  if (!Array.isArray(receipt.authority.denied_actions) || receipt.authority.denied_actions.length === 0) {
    issues.push('authority.denied_actions must be non-empty');
  }
  if (!Array.isArray(receipt.evidence.artifacts) || receipt.evidence.artifacts.length === 0) {
    issues.push('evidence.artifacts must be non-empty');
  }
  if (!Array.isArray(receipt.privacy.redacted_fields)) {
    issues.push('privacy.redacted_fields must be an array');
  }
  if (!Array.isArray(receipt.review.review_notes)) {
    issues.push('review.review_notes must be an array');
  }

  return { ok: issues.length === 0, issues };
}
