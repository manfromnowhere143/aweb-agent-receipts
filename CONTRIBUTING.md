# Contributing

This repository is intentionally narrow. Contributions should improve receipt
schema clarity, validator behavior, redaction safety, example coverage, or reviewer
documentation.

## Rules

- Do not add real secrets, API keys, private prompts, private account data, wallet
  secrets, viewing keys, seed phrases, provider credentials, or customer data.
- Do not add examples that imply custody, live trading, live payments, live bridge
  operation, or automated capital movement unless the example is clearly marked as a
  safe testnet/demo path and reviewed before publication.
- Keep fixtures deterministic and easy to validate locally.
- Explain every public/private boundary in the fixture or documentation.
- Prefer small, reviewable changes.

## Validation

Run:

```bash
npm test
```

Every fixture must pass `validate-examples.mjs`.

