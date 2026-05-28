import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = new URL(".", import.meta.url);
const fixturesDir = new URL("./fixtures/", root);
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
}

const files = (await readdir(fixturesDir))
  .filter((file) => file.endsWith(".json"))
  .sort();

assert(files.length > 0, "no fixture JSON files found");

const validated = [];
for (const file of files) {
  const fullPath = new URL(file, fixturesDir);
  const receipt = JSON.parse(await readFile(fullPath, "utf8"));
  assertReceiptShape(receipt, file);
  validated.push(path.join("fixtures", file));
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
  examples: {
    the_graph_receipt_indexing_subgraph: graphSubgraphFiles.map((file) =>
      path.join("examples", "the-graph-receipt-indexing-subgraph", file),
    ),
  },
}, null, 2));
