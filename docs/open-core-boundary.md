# Open-Core Boundary

Aweb uses an open-spec, closed-control-plane model.

## Open In This Repository

This repository contains the public trust surface:

- Mission Contract example schema,
- Agent Receipt example schema,
- simulated fixtures,
- local validator,
- redaction guidance,
- security model,
- public documentation,
- selected metadata-indexing examples.

These artifacts are useful because reviewers, developers, funders, and future partners
can inspect the shape of Aweb's authority and evidence model without needing access to
the hosted product.

## Private / Commercial

This repository does not include:

- Aweb Mission Control Cloud,
- Maestro Runtime internals,
- Trust Runtime policy engine,
- provider routing,
- API/MCP warehouse internals or provider genomes,
- hosted OS9 UI,
- approval workflow product,
- enterprise credential management,
- billing,
- tenant isolation,
- private telemetry storage,
- customer workspaces,
- production run orchestration.

Those systems are the commercial control plane.

## Why This Boundary

Trust primitives benefit from being inspectable. Hosted control planes, policy
execution, routing, recovery, enterprise administration, and operational data should
remain private until there is a deliberate product, security, and licensing decision.

The intended line is:

> Open schemas and examples. Closed hosted execution control plane.

This keeps Aweb credible as infrastructure while preserving the company moat.
