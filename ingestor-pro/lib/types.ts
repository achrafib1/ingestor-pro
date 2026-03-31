export type Tab = "ingest" | "history" | "settings" | "chat" | "graph";

export interface IngestedFile {
    name: string;
    path: string;
    content: string;
    size: number;
    tokens: number;
    type: "file" | "url";
    summary?: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface IngestionHistory {
    id: string;
    timestamp: number;
    source: string;
    type: "folder" | "url" | "files";
    files: IngestedFile[];
    totalTokens: number;
    totalSize: number;
}

export const DEFAULT_IGNORE_PATTERNS = [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    ".DS_Store",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.svg",
    "*.ico",
    "*.woff",
    "*.woff2",
    "*.ttf",
    "*.eot",
    "*.mp4",
    "*.webm",
    "*.mp3",
    "*.wav",
    "*.pdf",
    "*.zip",
    "*.tar.gz",
];
