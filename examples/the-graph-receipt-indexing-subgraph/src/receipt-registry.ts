import { ReceiptPublished } from "../generated/ReceiptRegistry/ReceiptRegistry";
import {
  AuthorityGrant,
  CapabilityUse,
  Receipt,
  RecoveryState,
  RedactionBoundary,
  WorkflowRun,
} from "../generated/schema";

export function handleReceiptPublished(event: ReceiptPublished): void {
  const id = event.params.receiptId.toHexString();

  const authority = new AuthorityGrant(id.concat("-authority"));
  authority.receiptId = event.params.receiptId;
  authority.mode = "public_metadata_indexing";
  authority.publicMetadataOnly = true;
  authority.deniedActions = [
    "publish_raw_prompt",
    "publish_private_payload",
    "publish_wallet_secret",
    "publish_provider_credentials",
    "index_unredacted_counterparty_data",
  ];
  authority.save();

  const workflow = new WorkflowRun(id.concat("-workflow"));
  workflow.receiptId = event.params.receiptId;
  workflow.environment = "public_index";
  workflow.intentSummary = "Index public receipt metadata for reviewer discovery.";
  workflow.save();

  const capability = new CapabilityUse(id.concat("-capability"));
  capability.receiptId = event.params.receiptId;
  capability.provider = "the_graph";
  capability.category = "receipt_metadata_indexing";
  capability.save();

  const redaction = new RedactionBoundary(id.concat("-redaction"));
  redaction.receiptId = event.params.receiptId;
  redaction.rawPromptIndexed = false;
  redaction.privatePayloadIndexed = false;
  redaction.indexedFields = [
    "receiptId",
    "scope",
    "metadataURI",
    "metadataHash",
    "requiresHumanReview",
  ];
  redaction.redactedFields = [
    "rawPrompt",
    "privateExecutionPayload",
    "walletSecret",
    "counterparty",
    "providerCredentials",
    "unredactedArtifactBody",
  ];
  redaction.save();

  const recovery = new RecoveryState(id.concat("-recovery"));
  recovery.receiptId = event.params.receiptId;
  recovery.humanReviewRequired = event.params.requiresHumanReview;
  recovery.note = event.params.requiresHumanReview
    ? "Human review required before relying on the receipt for downstream workflow decisions."
    : "Receipt metadata indexed for public discovery; private payload remains outside the graph.";
  recovery.save();

  const receipt = new Receipt(id);
  receipt.receiptId = event.params.receiptId;
  receipt.scope = event.params.scope;
  receipt.metadataURI = event.params.metadataURI;
  receipt.metadataHash = event.params.metadataHash;
  receipt.requiresHumanReview = event.params.requiresHumanReview;
  receipt.indexedAtBlock = event.block.number;
  receipt.indexedAtTimestamp = event.block.timestamp;
  receipt.authority = authority.id;
  receipt.workflow = workflow.id;
  receipt.capability = capability.id;
  receipt.redactionBoundary = redaction.id;
  receipt.recoveryState = recovery.id;
  receipt.save();
}
