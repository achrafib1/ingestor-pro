import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IngestedFile, IngestionHistory, DEFAULT_IGNORE_PATTERNS } from './types';

interface AppState {
    ingestedFiles: IngestedFile[];
    history: IngestionHistory[];
    ignorePatterns: string[];
    isDarkMode: boolean;
    geminiApiKey: string;
    currentSource: string | null;
    activeTab: "ingest" | "history" | "chat" | "settings" | "graph";

    setIngestedFiles: (files: IngestedFile[] | ((prev: IngestedFile[]) => IngestedFile[])) => void;
    setHistory: (history: IngestionHistory[] | ((prev: IngestionHistory[]) => IngestionHistory[])) => void;
    setIgnorePatterns: (patterns: string[]) => void;
    setIsDarkMode: (isDark: boolean) => void;
    setGeminiApiKey: (key: string) => void;
    setCurrentSource: (source: string | null) => void;
    setActiveTab: (tab: "ingest" | "history" | "chat" | "settings" | "graph") => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            ingestedFiles: [],
            history: [],
            ignorePatterns: DEFAULT_IGNORE_PATTERNS,
            isDarkMode: true,
            geminiApiKey: "",
            currentSource: null,
            activeTab: "ingest",

            setIngestedFiles: (files) => set((state) => ({
                ingestedFiles: typeof files === 'function' ? files(state.ingestedFiles) : files
            })),
            setHistory: (history) => set((state) => ({
                history: typeof history === 'function' ? history(state.history) : history
            })),
            setIgnorePatterns: (ignorePatterns) => set({ ignorePatterns }),
            setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
            setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
            setCurrentSource: (currentSource) => set({ currentSource }),
            setActiveTab: (activeTab) => set({ activeTab }),
        }),
        {
            name: 'ingestor-pro-storage',
        }
    )
);
