# Architecture

This document describes the implemented Ingestor Pro proof-of-concept
architecture. Planned production controls are identified separately and are
not presented as current behavior.

## System context

Ingestor Pro is a Next.js application with a browser-heavy processing model.
The browser reads local user-selected content, maintains workspace state, and
optionally communicates with Gemini. A single server route retrieves public
web pages so their static HTML can be converted to text.

```text
┌──────────────────────────────── Browser ────────────────────────────────┐
│                                                                        │
│  File inputs ─→ extractors ─→ application state ─→ workspace views    │
│                    │                    │                 │              │
│             PDF.js / SheetJS     local storage     D3 graph/export    │
│                                         │                              │
│                                         └──────────────→ Gemini API*   │
└───────────────────────────────┬────────────────────────────────────────┘
                                │ POST /api/scrape
                         ┌──────▼───────┐
                         │ Next.js route│ ──→ requested web origin
                         │ Axios/Cheerio│
                         └──────────────┘

* Only when a key is configured and an AI operation is requested.
```

## Application entry points

- `app/page.tsx` dynamically loads the client application with server-side
  rendering disabled.
- `app/client-page.tsx` coordinates ingestion, extraction, AI requests,
  navigation, export, and workspace actions.
- `app/api/scrape/route.ts` implements the only server-side application API.
- `lib/store.ts` defines persistent client state with Zustand.

## Ingestion workflows

### Local folders and files

1. The user selects content through a browser file input.
2. Folder files are compared with the configured ignore patterns.
3. The browser selects an extractor from the filename extension and MIME type.
4. PDF.js extracts text one page at a time from PDFs.
5. SheetJS serializes each spreadsheet sheet into CSV-like text.
6. Known binary formats are represented by a skipped-content message.
7. Other content is read as text and checked for basic binary markers.
8. Extracted content, byte size, and an approximate token count become an
   `IngestedFile` record.
9. The records are added to the current workspace and ingestion history.

All local-file processing in this path occurs in the browser. Files are not
uploaded to the Next.js scrape route.

### Web pages

1. The browser sends the supplied URL to `POST /api/scrape`.
2. The route retrieves the destination with Axios.
3. Cheerio removes scripts, styles, navigation, headers, footers, frames, and
   no-script elements.
4. The route collapses whitespace in the remaining body text.
5. The browser stores the returned text as a URL-backed `IngestedFile`.

This workflow processes one static HTML response. It does not render
JavaScript, crawl links, honor site-specific extraction rules, or retain the
original markup.

## State and persistence

`lib/store.ts` persists these values under `ingestor-pro-storage` in browser
local storage:

- Current ingested files and their extracted content
- Ingestion history
- Ignore patterns
- Theme preference
- Gemini API key entered in settings
- Current source and active tab

Selected-file state, chat messages, search text, and transient loading state
remain component-local and are not included in the Zustand persistence model.
There is no server database or cross-device synchronization.

## AI integration

The browser constructs a Google Gen AI client from the key stored in settings
or the client-exposed configuration variable. Two operations are implemented:

- During ingestion, files above the small-file threshold can be summarized
  using a truncated content sample.
- Chat concatenates the current workspace content with the user question and
  sends that context to Gemini.

AI processing is optional and external. Provider availability, quotas, model
names, request limits, and responses are outside the application's control.

## Relationship visualization

The graph creates one node per file. Node radius derives from byte size and
color derives from the filename extension. Links are created when files share
their first directory segment or, with a lower weight, share an extension.
D3 supplies force layout, dragging, zooming, and panning.

The result is a navigational visualization of structural similarity. It does
not parse imports, derive entities, calculate embeddings, or model semantic
relationships.

## Trust boundaries

| Boundary | Data crossing it | Current control |
| --- | --- | --- |
| Local file to browser | User-selected content | Explicit browser selection |
| Browser storage | Extracted content and settings | Same-origin browser storage |
| Browser to Next.js | User-supplied URL | Required-field check only |
| Next.js to website | HTTP request | Fixed user-agent header |
| Browser to Gemini | Key, prompts, file content | User configures key and invokes AI |

The current architecture is appropriate for local demonstration and
experimentation. A public deployment requires the hardening described in
[Security](SECURITY.md).

## Planned evolution

The next architectural priorities are a server-side AI boundary, constrained
URL fetching, ingestion size limits, content chunking, and automated coverage
of extractors and API behavior. These capabilities are not implemented today.
