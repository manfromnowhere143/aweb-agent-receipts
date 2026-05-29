# Contributing

This repository is intentionally narrow. Contributions should improve Mission Contract
and Agent Receipt schema clarity, validator behavior, redaction safety, example
coverage, or reviewer documentation.

## Rules

- Do not add real secrets, API keys, private prompts, private account data, wallet
  secrets, viewing keys, seed phrases, provider credentials, or customer data.
- Do not add real customer emails, source code, security payloads, invoices,
  bank details, production deploy commands, or private business records.
- Do not add examples that imply custody, live trading, live payments, live bridge
  operation, or automated capital movement unless the example is clearly marked as a
  safe testnet/demo path and reviewed before publication.
- Do not add examples that imply autonomous external email sending, production deploys,
  security remediation, spend approval, or business-record mutation without explicit
  approval evidence.
- Keep fixtures deterministic and easy to validate locally.
- Explain every public/private boundary in the fixture or documentation.
- Prefer small, reviewable changes.

## Validation

Run:

```bash
npm test
```

Every fixture and Mission Contract example must pass `validate-examples.mjs`.
