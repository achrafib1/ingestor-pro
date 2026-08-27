# Contributing to Ingestor Pro

Thank you for considering a contribution. Ingestor Pro is an evolving proof of
concept, so focused changes with explicit behavior and constraints are the most
useful.

## Development setup

1. Install Node.js compatible with Next.js 15 and pnpm.
2. Install dependencies with `pnpm install`.
3. Start the application with `pnpm dev`.
4. Open `http://localhost:3000` and exercise the affected workflow.

Gemini configuration is optional. Use disposable development credentials and
non-sensitive sample data when testing AI behavior.

## Change guidelines

- Keep browser, server, and external-provider responsibilities explicit.
- Add capability claims only when the implementation supports them.
- Mark demonstration behavior, security constraints, and planned work clearly.
- Avoid committing local environment files, credentials, generated output, or
  captured user content.
- Preserve strict TypeScript checking and follow the surrounding code style.
- Keep interface components focused; place cross-feature orchestration in the
  application layer and shared state in `lib/store.ts`.
- Update the README or focused documentation when behavior or boundaries change.

## Verification

Before proposing a change:

```bash
pnpm build
```

Also exercise the affected path manually. Relevant paths may include local
file ingestion, folder filtering, PDF or spreadsheet extraction, URL retrieval,
workspace persistence, export, graph interaction, and Gemini error handling.

The repository does not yet contain an automated test suite. Contributions
that introduce test infrastructure should document the new commands and keep
tests close to the behavior they verify.

## Pull requests

A focused pull request should explain:

- The problem being addressed
- The implemented behavior
- How the behavior was verified
- Any privacy, security, compatibility, or migration implications
- Known limitations or deliberately deferred work

Do not include real credentials, private documents, application logs, generated
build output, or unrelated formatting changes.
