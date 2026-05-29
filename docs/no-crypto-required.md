# No Crypto Required

Aweb Agent Control Specs are domain-neutral.

The core model does not require a chain, token, wallet, payment rail, smart contract,
or grant ecosystem:

> Mission Contract before execution. Agent Receipt after execution. Operational graph across everything.

## Non-Crypto First Use Cases

The most important examples for Aweb's current company direction are:

- business communications,
- funding operations,
- GitHub pull-request review,
- cloud deployment approval,
- security ticket triage,
- CRM or funding-ledger updates,
- accounting and spend approval.

These domains show the same control problem without any crypto assumptions:

- authority,
- approved tools,
- credential boundaries,
- side-effect gates,
- redaction,
- recovery,
- evidence.

## Why Web3 Examples Exist

Web3 and payment-adjacent examples remain useful as stress tests because they force the
receipt model to be precise about:

- custody,
- signing,
- broadcast,
- payment,
- token launch,
- private keys,
- privacy,
- settlement,
- audit trails.

Those examples are deliberately simulated or read-only unless explicitly marked
otherwise. They are not Aweb's product category and not the company identity.

## How Reviewers Should Read This Repository

Read the non-crypto examples first.

Then read Web3/payment-adjacent fixtures as high-risk boundary tests: if the schema can
clearly deny custody, signing, fund movement, and unsafe automation in those domains,
it can also describe safer enterprise workflows such as email, PR review, cloud
deployments, security tickets, CRM updates, and accounting approvals.

## Messaging Rule

Do not describe Aweb as a Web3 company based on this repository.

Correct framing:

> Aweb publishes open control and evidence specs for AI-agent work. Web3 fixtures are high-risk stress tests. The company is building Mission Control Cloud for governed agent execution.
