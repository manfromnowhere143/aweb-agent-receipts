# Security Model

This repository is a public specification and fixture corpus. It should never contain
raw operational secrets or production customer data.

## Security Goals

The public specs aim to make agent work inspectable without exposing private execution
payloads.

Security goals:

- define authority before action,
- make side effects explicit,
- keep sensitive actions approval-gated,
- preserve receipt-grade evidence,
- redact private payloads,
- represent credential boundaries without exposing credentials,
- record failure and recovery state,
- avoid publishing unsafe automation details.

## Mission Contract Boundary

A Mission Contract should expose:

- mission type,
- high-level intent,
- success criteria,
- allowed capability classes,
- credential-boundary names,
- approval gates,
- evidence requirements,
- recovery rules,
- receipt requirements.

A Mission Contract should not expose:

- real API keys,
- OAuth tokens,
- private mailbox contents,
- raw customer records,
- private source code,
- security payloads,
- invoices or bank details,
- production deploy commands,
- full provider payloads,
- private operator notes.

## Agent Receipt Boundary

An Agent Receipt should expose:

- receipt ID,
- contract ID when available,
- authority class,
- allowed and denied action classes,
- workflow class,
- provider/tool class,
- policy decision,
- approval state,
- cost class,
- failure/recovery state,
- redacted artifact references,
- human-review state.

An Agent Receipt should not expose:

- raw prompts,
- secrets,
- credentials,
- unredacted private payloads,
- private counterparties,
- sensitive source/security/finance/customer details,
- exploit details,
- exact deploy commands,
- unsafe automation instructions.

## Default-Deny Rule

Examples should default to denied side effects unless a human approval token or
explicit review state is represented.

Side effects include:

- external sends,
- business-record writes,
- production deploys,
- security remediation,
- spend or payment,
- credential or scope changes,
- wallet signing or transaction broadcast,
- custody or fund movement.

## Public Example Rule

Every public example should be safe if copied into a public issue, investor packet,
or documentation site. If that is not true, redact the field or replace it with a
placeholder artifact reference.
