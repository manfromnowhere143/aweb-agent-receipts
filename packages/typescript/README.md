# @aweb-labs/agent-control-specs

Source-only TypeScript helpers for the public Aweb Agent Control Specs.

This package is intentionally small. It exposes types and lightweight validation helpers for:

- Mission Contracts before execution.
- Agent Receipts after execution.

It does not include Aweb Mission Control Cloud, Maestro Runtime, Trust Runtime, provider routing, hosted OS9 UI, billing, enterprise controls, or private warehouse internals.

## Boundary

Use these helpers to validate public examples, fixtures, docs, and integrations that need to understand the open spec shape.

Do not use this package as a production authorization engine. Production policy enforcement belongs in a controlled runtime.
