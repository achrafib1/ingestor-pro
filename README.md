# Ingestor Pro

Ingestor Pro is a browser-based workspace for collecting text from local
files, folders, spreadsheets, PDFs, and web pages. It turns those sources into
a searchable workspace with content previews, export tools, ingestion history,
file-relationship visualization, and optional Gemini-assisted exploration.

> [!IMPORTANT]
> Ingestor Pro is an actively developed proof of concept. It demonstrates the
> complete local ingestion and exploration workflow, but it is not hardened for
> production or multi-user deployment.

## Capabilities

- Ingest a browser-selected folder or a set of individual files.
- Extract embedded text from PDFs and convert spreadsheet sheets to CSV text.
- Retrieve and clean the static HTML text of a public web page.
- Search files and browse them as a list or directory tree.
- Preview, clean, copy, and download extracted text.
- Track approximate token counts, byte sizes, and ingestion history.
- Visualize heuristic relationships between files with an interactive D3 graph.
- Generate file summaries and ask questions across the current workspace with
  Google Gemini.
- Persist the workspace and preferences between browser sessions.

## How it works

```text
Local files ──→ browser-side extraction ──┐
                                          ├─→ persisted workspace
Public URL ──→ Next.js scrape endpoint ───┘          │
                                                     ├─→ search and preview
                                                     ├─→ copy and export
                                                     ├─→ relationship graph
                                                     └─→ optional Gemini request
```

Most processing happens in the browser. The Next.js server is used for URL
retrieval; Gemini requests are initiated by the browser only when AI features
are configured and used. See [Architecture](docs/ARCHITECTURE.md) for the full
component and data-flow description.

## Technology

| Area | Implementation |
| --- | --- |
| Application | Next.js 15 App Router, React 19, TypeScript |
| Interface | Tailwind CSS 4, Base UI, Motion, Lucide |
| Client state | Zustand with browser local-storage persistence |
| Documents | PDF.js and SheetJS |
| Web ingestion | Axios and Cheerio in a Next.js route handler |
| AI integration | Google Gen AI SDK |
| Visualization | D3 force simulation |

## Repository layout

```text
app/
├── api/scrape/route.ts  # Static HTML retrieval and text extraction
├── client-page.tsx      # Application orchestration and ingestion logic
├── layout.tsx           # Root layout and metadata
└── page.tsx             # Client-only application entry point
components/
├── ingestor/            # Workspace, history, graph, chat, and settings
└── ui/                  # Reusable interface primitives
docs/                    # Architecture and security documentation
lib/
├── store.ts             # Persisted Zustand application state
├── types.ts             # Shared application models and defaults
└── utils.ts             # Formatting and token-estimation helpers
```

## Local development

### Requirements

- Node.js compatible with Next.js 15
- [pnpm](https://pnpm.io/)
- A modern browser with the File System input APIs used by folder selection

### Setup

```bash
git clone https://github.com/achrafib1/ingestor-pro.git
cd ingestor-pro
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

AI features are optional. Without a Gemini API key, local ingestion, web
retrieval, browsing, graphing, history, copying, and export remain available.

### Optional Gemini configuration

The recommended proof-of-concept setup is to enter a key in the application
settings. The application also recognizes this client-exposed variable in a
local environment file:

```text
NEXT_PUBLIC_GEMINI_API_KEY=replace-me-locally
```

Any variable prefixed with `NEXT_PUBLIC_` is included in browser-accessible
code. Do not treat it as a server-side secret. Read [Security](docs/SECURITY.md)
before enabling AI features or processing non-public material.

## Usage

1. Choose **Local Folder**, **Single Files**, or **Web Content**.
2. Review the extracted files, token estimate, and total size.
3. Search the workspace or switch between list and tree views.
4. Select a file to preview, clean, copy, or download its extracted text.
5. Open **Knowledge Graph** to inspect file-type and directory relationships.
6. If Gemini is configured, generate summaries during ingestion or use
   **Chat with Data** to ask questions across the workspace.

The settings screen can change the theme, add ingestion ignore patterns,
restore the default patterns, clear history, and configure Gemini access.

## Web ingestion API

`POST /api/scrape` accepts JSON containing a `url` field:

```json
{
  "url": "https://example.com/docs"
}
```

On success it returns the page title, normalized body text, and requested URL.
The endpoint extracts static response HTML; it does not execute client-side
JavaScript or crawl linked pages.

> [!WARNING]
> The current route does not restrict destination hosts, private-network
> addresses, response sizes, or request duration. Do not expose it as a public
> service without adding URL validation and network-level protections.

## Quality checks

The repository currently provides these package scripts:

```bash
pnpm dev
pnpm build
pnpm start
```

TypeScript strict mode is enabled. An automated test suite is not yet present.
The existing `lint` script requires migration to a supported ESLint command
before it can be treated as a project quality gate.

## Current limitations

- Folder selection depends on browser-specific directory input support.
- PDF extraction handles embedded text only; scanned documents require OCR.
- Spreadsheet formulas and formatting are flattened into CSV-like text.
- Binary files are skipped, and all supported content is held in browser memory.
- Ignore-pattern matching is a lightweight wildcard approximation, not full
  `.gitignore` semantics.
- Token counts use a character-based estimate rather than model tokenization.
- Content cleanup is regex-based and may alter meaningful whitespace or syntax.
- Graph links represent shared directory roots or file extensions, not semantic
  relationships.
- Gemini prompts can include full ingested content and are limited by provider
  context, quota, model availability, and request-size constraints.
- There is no authentication, authorization, shared database, background job
  processing, or multi-user isolation.

## Roadmap

- Move AI requests and credentials behind a server-side integration boundary.
- Add URL validation, request limits, timeouts, and private-network blocking.
- Introduce unit and integration tests for extraction and route behavior.
- Replace the legacy lint script with explicit ESLint and formatting checks.
- Add ingestion limits and chunking for large workspaces.
- Improve content-type validation, error reporting, and accessible interaction.
- Add semantic chunking and embeddings only after their persistence and privacy
  model is defined.

## Contributing

Contributions are welcome while the project evolves. Start with
[CONTRIBUTING.md](CONTRIBUTING.md), and keep new capability claims tied to
implemented and verifiable behavior.

## License

No license has been added yet. Until one is provided, the repository remains
all rights reserved under default copyright rules.
