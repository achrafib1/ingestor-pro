# Security

Ingestor Pro is currently a proof of concept intended for local evaluation.
This document records its implemented boundaries and the controls required
before operating it as a public or production service.

## Data handling

Local files are read in the browser after explicit selection. Extracted file
content, ingestion history, preferences, and a Gemini key entered in settings
are persisted in browser local storage under the current origin.

Local storage is not encrypted application storage. Anyone with access to the
browser profile, an active same-origin script context, or browser developer
tools may be able to inspect it. Use only disposable development credentials
and non-sensitive sample content with the current implementation.

## External transmission

Local ingestion does not upload files to the application's scrape endpoint.
Content does leave the browser when an AI feature is used:

- Summary generation sends a sample of each eligible file to Gemini.
- Chat sends the current workspace content and the user's question to Gemini.

Users are responsible for ensuring that they are permitted to send the chosen
content to the configured AI provider. Provider retention, processing, and
regional policies apply independently of this project.

## Gemini credentials

Gemini is instantiated in browser code. A key entered in settings is persisted
in local storage; a `NEXT_PUBLIC_` key is bundled into browser-accessible code.
Neither method provides a confidential server-side credential boundary.

Before a public deployment, proxy AI operations through an authenticated
server-side route, keep provider credentials outside browser bundles, validate
request sizes, and apply per-user authorization and rate limits.

## URL retrieval boundary

`POST /api/scrape` currently retrieves a user-provided URL from the server. It
checks only that a value is present. It does not currently enforce:

- Allowed schemes or destination hosts
- Blocking of loopback, link-local, or private-network addresses
- Redirect validation
- Response time or download-size limits
- Content-type restrictions
- Authentication, rate limiting, or per-user quotas

This creates a server-side request forgery and resource-exhaustion risk if the
route is exposed to untrusted users. Keep it local until these controls exist.

## Content safety

Retrieved HTML is parsed as data and reduced to text, but remote content and
local documents must still be treated as untrusted input. Gemini prompts may
contain instructions embedded in ingested documents, so AI responses should
not be treated as authoritative or permitted to trigger privileged actions.

The application displays extracted text through React rather than inserting
raw HTML. Exported text can still contain untrusted content and should be
handled accordingly by downstream tools.

## Deployment checklist

The following items are required before describing the project as production
ready:

- Move Gemini credentials and requests to an authenticated server boundary.
- Add URL parsing, scheme allowlisting, DNS/IP validation, and redirect checks.
- Enforce request timeouts, body-size limits, and accepted content types.
- Add authentication, authorization, rate limiting, and audit-safe errors.
- Define retention and deletion behavior for ingested content.
- Add dependency review and automated security and behavior tests.
- Publish a supported vulnerability-reporting channel.

These items are planned safeguards, not descriptions of current behavior.
