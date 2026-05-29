import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = new URL(".", import.meta.url);
const fixturesDir = new URL("./fixtures/", root);
const missionContractsDir = new URL("./examples/mission-contracts/", root);
const graphSubgraphDir = new URL("./examples/the-graph-receipt-indexing-subgraph/", root);

const requiredTopLevel = [
  "receipt_version",
  "receipt_id",
  "example",
  "created_at",
  "scope",
  "authority",
  "agent",
  "workflow",
  "capability",
  "execution",
  "evidence",
  "privacy",
  "review",
];

const requiredNested = {
  authority: ["grant_id", "mode", "authorized_by", "allowed_actions", "denied_actions"],
  agent: ["agent_id", "model_class", "operator"],
  workflow: ["workflow_id", "intent", "environment"],
  capability: ["provider", "tool", "category"],
  execution: ["status", "started_at", "finished_at", "idempotency_key", "cost"],
  evidence: ["summary", "artifacts"],
  privacy: ["redaction_policy", "redacted_fields"],
  review: ["trust_state", "human_review_required", "review_notes"],
};

const requiredMissionContractTopLevel = [
  "contract_version",
  "contract_id",
  "example",
  "created_at",
  "mission",
  "success_criteria",
  "allowed_capabilities",
  "credential_boundaries",
  "approval_gates",
  "evidence_requirements",
  "execution_policy",
  "recovery_plan",
  "receipt_schema",
  "operational_graph",
];

const nonCryptoScopes = new Set([
  "communications_funding_ops",
  "github_pr_review",
  "cloud_deploy_approval",
  "security_ticket_triage",
  "crm_funding_ledger_update",
  "accounting_approval",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertReceiptShape(receipt, file) {
  for (const key of requiredTopLevel) {
    assert(Object.hasOwn(receipt, key), `${file}: missing ${key}`);
  }

  assert(receipt.receipt_version === "aweb.agent_receipt.v0.1", `${file}: wrong receipt_version`);
  assert(receipt.example === true, `${file}: examples must be marked example=true`);

  for (const [parent, keys] of Object.entries(requiredNested)) {
    assert(receipt[parent] && typeof receipt[parent] === "object", `${file}: ${parent} must be an object`);
    for (const key of keys) {
      assert(Object.hasOwn(receipt[parent], key), `${file}: missing ${parent}.${key}`);
    }
  }

  assert(Array.isArray(receipt.authority.allowed_actions), `${file}: allowed_actions must be an array`);
  assert(Array.isArray(receipt.authority.denied_actions), `${file}: denied_actions must be an array`);
  assert(Array.isArray(receipt.evidence.artifacts), `${file}: evidence.artifacts must be an array`);
  assert(Array.isArray(receipt.privacy.redacted_fields), `${file}: privacy.redacted_fields must be an array`);
  assert(Array.isArray(receipt.review.review_notes), `${file}: review.review_notes must be an array`);

  if (receipt.workflow?.contract_id) {
    assert(
      typeof receipt.workflow.contract_id === "string" && receipt.workflow.contract_id.length >= 8,
      `${file}: workflow.contract_id must be a stable public reference when present`,
    );
  }
}

function assertMissionContractShape(contract, file) {
  for (const key of requiredMissionContractTopLevel) {
    assert(Object.hasOwn(contract, key), `${file}: missing ${key}`);
  }

  assert(
    contract.contract_version === "aweb.mission_contract.v0.1",
    `${file}: wrong contract_version`,
  );
  assert(contract.example === true, `${file}: examples must be marked example=true`);
  assert(contract.mission && typeof contract.mission === "object", `${file}: mission must be an object`);
  for (const key of [
    "mission_id",
    "mission_type",
    "workspace_id",
    "operator_id",
    "user_intent",
    "clarified_business_goal",
  ]) {
    assert(Object.hasOwn(contract.mission, key), `${file}: missing mission.${key}`);
  }

  for (const key of [
    "success_criteria",
    "allowed_capabilities",
    "credential_boundaries",
    "approval_gates",
    "evidence_requirements",
  ]) {
    assert(Array.isArray(contract[key]) && contract[key].length > 0, `${file}: ${key} must be a non-empty array`);
  }

  const capabilityIds = new Set(contract.allowed_capabilities.map((capability) => capability.capability_id));
  const boundaryIds = new Set(contract.credential_boundaries.map((boundary) => boundary.boundary_id));
  const gatedCapabilityIds = new Set(
    contract.approval_gates.flatMap((gate) => gate.blocks_capabilities ?? []),
  );
  const evidenceCapabilityIds = new Set(
    contract.evidence_requirements.flatMap((requirement) => requirement.applies_to_capability_ids ?? []),
  );

  for (const capability of contract.allowed_capabilities) {
    for (const key of [
      "capability_id",
      "source",
      "slug",
      "mode",
      "risk_class",
      "approval_required",
      "evidence_required",
      "credential_boundary_id",
    ]) {
      assert(Object.hasOwn(capability, key), `${file}: missing capability.${key}`);
    }

    assert(
      boundaryIds.has(capability.credential_boundary_id),
      `${file}: ${capability.capability_id} references unknown credential boundary ${capability.credential_boundary_id}`,
    );

    const sideEffecting =
      capability.approval_required ||
      ["write", "send"].includes(capability.mode) ||
      ["write", "send", "spend", "deploy", "admin", "identity", "legal"].includes(capability.risk_class);
    if (sideEffecting) {
      assert(
        capability.approval_required === true,
        `${file}: ${capability.capability_id} has side-effect risk but approval_required is not true`,
      );
      assert(
        gatedCapabilityIds.has(capability.capability_id),
        `${file}: ${capability.capability_id} has side-effect risk but no approval gate covers it`,
      );
    }

    if (capability.evidence_required) {
      assert(
        evidenceCapabilityIds.has(capability.capability_id),
        `${file}: ${capability.capability_id} requires evidence but no evidence requirement covers it`,
      );
    }
  }

  for (const gate of contract.approval_gates) {
    assert(gate.default_decision === "block", `${file}: ${gate.gate_id} must default to block`);
    for (const capabilityId of gate.blocks_capabilities) {
      assert(capabilityIds.has(capabilityId), `${file}: ${gate.gate_id} references unknown capability ${capabilityId}`);
    }
  }

  for (const requirement of contract.evidence_requirements) {
    assert(requirement.required === true, `${file}: ${requirement.requirement_id} must be required`);
    for (const capabilityId of requirement.applies_to_capability_ids) {
      assert(
        capabilityIds.has(capabilityId),
        `${file}: ${requirement.requirement_id} references unknown capability ${capabilityId}`,
      );
    }
  }

  assert(
    contract.receipt_schema?.links_to_contract === true,
    `${file}: receipt_schema.links_to_contract must be true`,
  );
  assert(
    Array.isArray(contract.receipt_schema.required_fields) &&
      contract.receipt_schema.required_fields.includes("contract_id"),
    `${file}: receipt_schema.required_fields must include contract_id`,
  );

  const graphNodeIds = new Set((contract.operational_graph.nodes ?? []).map((node) => node.node_id));
  assert(graphNodeIds.size > 0, `${file}: operational_graph.nodes must be non-empty`);
  for (const edge of contract.operational_graph.edges ?? []) {
    assert(graphNodeIds.has(edge.from), `${file}: graph edge from unknown node ${edge.from}`);
    assert(
      graphNodeIds.has(edge.to) || capabilityIds.has(edge.to),
      `${file}: graph edge to unknown node or capability ${edge.to}`,
    );
  }
}

const files = (await readdir(fixturesDir))
  .filter((file) => file.endsWith(".json"))
  .sort();

assert(files.length > 0, "no fixture JSON files found");

const validated = [];
let nonCryptoReceiptCount = 0;
for (const file of files) {
  const fullPath = new URL(file, fixturesDir);
  const receipt = JSON.parse(await readFile(fullPath, "utf8"));
  assertReceiptShape(receipt, file);
  if (nonCryptoScopes.has(receipt.scope)) {
    nonCryptoReceiptCount += 1;
  }
  validated.push(path.join("fixtures", file));
}

assert(
  nonCryptoReceiptCount >= 6,
  `expected at least 6 non-crypto receipt fixtures, found ${nonCryptoReceiptCount}`,
);

const missionContractFiles = (await readdir(missionContractsDir))
  .filter((file) => file.endsWith(".json"))
  .sort();

assert(missionContractFiles.length > 0, "no Mission Contract example JSON files found");

const validatedMissionContracts = [];
for (const file of missionContractFiles) {
  const fullPath = new URL(file, missionContractsDir);
  const contract = JSON.parse(await readFile(fullPath, "utf8"));
  assertMissionContractShape(contract, file);
  validatedMissionContracts.push(path.join("examples", "mission-contracts", file));
}

const graphSubgraphFiles = [
  "README.md",
  "subgraph.yaml",
  "schema.graphql",
  "sample-query.graphql",
  "abis/ReceiptRegistry.json",
  "src/receipt-registry.ts",
];

for (const file of graphSubgraphFiles) {
  const content = await readFile(new URL(file, graphSubgraphDir), "utf8");
  assert(content.trim().length > 0, `examples/the-graph-receipt-indexing-subgraph/${file}: empty file`);
}

const requiredDocs = [
  "docs/open-core-boundary.md",
  "docs/no-crypto-required.md",
  "docs/security-model.md",
  "docs/redaction-guide.md",
  "docs/grant-context.md",
];

const requiredTypeScriptPackageFiles = [
  "packages/typescript/package.json",
  "packages/typescript/README.md",
  "packages/typescript/src/index.ts",
];

for (const file of [...requiredDocs, ...requiredTypeScriptPackageFiles]) {
  const content = await readFile(new URL(file, root), "utf8");
  assert(content.trim().length > 0, `${file}: empty file`);
}

const graphSchema = await readFile(new URL("schema.graphql", graphSubgraphDir), "utf8");
for (const typeName of [
  "Receipt",
  "AuthorityGrant",
  "WorkflowRun",
  "CapabilityUse",
  "RedactionBoundary",
  "RecoveryState",
]) {
  assert(
    graphSchema.includes(`type ${typeName} @entity`),
    `examples/the-graph-receipt-indexing-subgraph/schema.graphql: missing ${typeName} entity`,
  );
}

const graphManifest = await readFile(new URL("subgraph.yaml", graphSubgraphDir), "utf8");
for (const required of [
  "ReceiptPublished",
  "receipt-registry.ts",
  "schema.graphql",
  "ReceiptRegistry.json",
]) {
  assert(
    graphManifest.includes(required),
    `examples/the-graph-receipt-indexing-subgraph/subgraph.yaml: missing ${required}`,
  );
}

const graphAbi = JSON.parse(await readFile(new URL("abis/ReceiptRegistry.json", graphSubgraphDir), "utf8"));
assert(Array.isArray(graphAbi), "examples/the-graph-receipt-indexing-subgraph/abis/ReceiptRegistry.json: ABI must be an array");
assert(
  graphAbi.some((item) => item.type === "event" && item.name === "ReceiptPublished"),
  "examples/the-graph-receipt-indexing-subgraph/abis/ReceiptRegistry.json: missing ReceiptPublished event",
);

console.log(JSON.stringify({
  ok: true,
  count: validated.length,
  validated,
  mission_contracts: {
    count: validatedMissionContracts.length,
    validated: validatedMissionContracts,
  },
  non_crypto_receipt_count: nonCryptoReceiptCount,
  examples: {
    required_docs: requiredDocs,
    typescript_package: requiredTypeScriptPackageFiles,
    the_graph_receipt_indexing_subgraph: graphSubgraphFiles.map((file) =>
      path.join("examples", "the-graph-receipt-indexing-subgraph", file),
    ),
  },
}, null, 2));
