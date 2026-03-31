"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Copy,
    Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import { GoogleGenAI } from "@google/genai";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

import { cn, formatBytes, estimateTokens } from "@/lib/utils";
import { IngestedFile, IngestionHistory, DEFAULT_IGNORE_PATTERNS, Tab } from "@/lib/types";

// Modularized Components
import { Sidebar } from "@/components/ingestor/Sidebar";
import { Workspace } from "@/components/ingestor/Workspace";
import { History } from "@/components/ingestor/History";
import { Chat } from "@/components/ingestor/Chat";
import { Settings } from "@/components/ingestor/Settings";
import { Graph } from "@/components/ingestor/Graph";
import { useAppStore } from "@/lib/store";

export default function App() {
    const [mounted, setMounted] = React.useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [ingestionType, setIngestionType] = useState<"folder" | "url">("folder");
    const [url, setUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<IngestedFile | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "tree">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatting, setIsChatting] = useState(false);
    const [ingestingTarget, setIngestingTarget] = useState<"folder" | "file" | "url" | null>(null);

    const {
        ingestedFiles, setIngestedFiles,
        history, setHistory,
        ignorePatterns, setIgnorePatterns,
        isDarkMode, setIsDarkMode,
        geminiApiKey, setGeminiApiKey,
        currentSource, setCurrentSource,
        activeTab, setActiveTab
    } = useAppStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    const readFileContent = async (file: File): Promise<string> => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.type;

        if (extension === 'pdf' || mimeType === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items
                        .map((item: any) => (item as any).str)
                        .join(' ');
                    text += `--- Page ${i} ---\n${pageText}\n\n`;
                }
                return text || "[No text content found in PDF]";
            } catch (err) {
                console.error("PDF parsing error:", err);
                return `[Error parsing PDF: ${file.name}. This might be a scanned document or have restricted permissions.]`;
            }
        } else if (
            ['xlsx', 'xls', 'csv'].includes(extension || '') ||
            ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(mimeType)
        ) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                let text = '';
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    text += `--- Sheet: ${sheetName} ---\n`;
                    text += XLSX.utils.sheet_to_csv(worksheet) + '\n\n';
                });
                return text || "[No data found in Excel file]";
            } catch (err) {
                console.error("Excel parsing error:", err);
                return `[Error parsing Excel: ${file.name}]`;
            }
        } else {
            // Check for other common binary formats to avoid "symbols"
            const binaryExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'zip', 'tar', 'gz', 'exe', 'dll', 'so', 'dylib', 'pyc', 'class'];
            if (binaryExtensions.includes(extension || '') || mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
                return `[Binary file detected: ${file.name}. Content skipped to avoid corruption.]`;
            }

            // Default to text for other files
            try {
                const text = await file.text();
                // Basic check for binary content in text
                if (text.includes('\u0000') || text.includes('\uFFFD')) {
                    return `[Potential binary content detected in ${file.name}. Content might be corrupted or unreadable.]`;
                }
                return text;
            } catch (err) {
                return `[Error reading file as text: ${file.name}]`;
            }
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const singleFileInputRef = useRef<HTMLInputElement>(null);

    // Apply theme
    useEffect(() => {
        localStorage.setItem("ingestor_theme", isDarkMode ? "dark" : "light");
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    const generateSummaries = async (files: IngestedFile[]) => {
        const apiKey = geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        if (!apiKey) return;

        const ai = new GoogleGenAI({ apiKey });
        const updatedFiles = [...ingestedFiles];

        for (const file of files) {
            if (file.tokens < 50) continue; // Skip very small files

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: `Summarize this file in one short sentence: ${file.name}\n\nContent:\n${file.content.substring(0, 2000)}`,
                    config: {
                        systemInstruction: "You are a helpful assistant that provides extremely concise one-sentence summaries of files.",
                    }
                });

                const summary = response.text || "No summary available.";
                const index = updatedFiles.findIndex(f => f.path === file.path);
                if (index !== -1) {
                    updatedFiles[index] = { ...updatedFiles[index], summary };
                }
            } catch (err) {
                console.error(`Error generating summary for ${file.name}:`, err);
            }
        }
        setIngestedFiles(updatedFiles);
    };

    const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIngestingTarget("folder");
        const newFiles: IngestedFile[] = [];
        const fileList = Array.from(files);

        const folderName = fileList.length > 0 && fileList[0].webkitRelativePath
            ? fileList[0].webkitRelativePath.split('/')[0]
            : "Local Folder";

        for (const fileObj of fileList) {
            const file = fileObj as any;
            const path = file.webkitRelativePath || file.name;

            // Check ignore patterns
            const shouldIgnore = ignorePatterns.some(pattern => {
                const regex = new RegExp(pattern.replace(/\*/g, ".*").replace(/\./g, "\\."));
                return regex.test(path);
            });

            if (shouldIgnore) continue;

            try {
                const content = await readFileContent(file as any);
                newFiles.push({
                    name: file.name,
                    path: path,
                    content: content,
                    size: file.size,
                    tokens: estimateTokens(content),
                    type: "file"
                });
            } catch (err) {
                console.error(`Error reading file ${path}:`, err);
            }
        }

        if (newFiles.length > 0) {
            setIngestedFiles(prev => [...prev, ...newFiles]);
            addToHistory(newFiles, folderName, "folder");
            setCurrentSource(folderName);
            toast.success(`Successfully ingested ${newFiles.length} files`);
            generateSummaries(newFiles);
        } else {
            toast.error("No valid files found after filtering");
        }
        setIngestingTarget(null);
        setActiveTab("ingest");
    };

    const handleSingleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIngestingTarget("file");
        const newFiles: IngestedFile[] = [];
        const fileList = Array.from(files);

        const sourceName = fileList.length === 1 ? fileList[0].name : `${fileList.length} Files`;

        for (const fileObj of fileList) {
            const file = fileObj as any;
            try {
                const content = await readFileContent(file);
                newFiles.push({
                    name: file.name,
                    path: file.name,
                    content: content,
                    size: file.size,
                    tokens: estimateTokens(content),
                    type: "file"
                });
            } catch (err) {
                console.error(`Error reading file ${file.name}:`, err);
            }
        }

        if (newFiles.length > 0) {
            setIngestedFiles(prev => [...prev, ...newFiles]);
            addToHistory(newFiles, sourceName, "folder");
            setCurrentSource(sourceName);
            toast.success(`Successfully ingested ${newFiles.length} files`);
            generateSummaries(newFiles);
        }
        setIngestingTarget(null);
        setActiveTab("ingest");
    };

    const handleUrlScrape = async () => {
        if (!url) return;
        setIngestingTarget("url");

        try {
            const response = await fetch("/api/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const newFile: IngestedFile = {
                name: data.title,
                path: data.url,
                content: data.content,
                size: new Blob([data.content]).size,
                tokens: estimateTokens(data.content),
                type: "url"
            };

            const domain = new URL(url).hostname;
            setIngestedFiles(prev => [...prev, newFile]);
            addToHistory([newFile], domain, "url");
            setCurrentSource(domain);
            toast.success("URL scraped successfully");
            generateSummaries([newFile]);
        } catch (err: any) {
            toast.error(err.message || "Failed to scrape URL");
        } finally {
            setIngestingTarget(null);
            setActiveTab("ingest");
        }
    };

    const cleanupContent = (content: string) => {
        // Basic intelligent cleanup
        return content
            .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // Remove comments
            .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
            .replace(/[ \t]+/g, ' ') // Collapse whitespace
            .trim();
    };

    const handleCleanup = () => {
        if (!selectedFile) return;
        const cleaned = cleanupContent(selectedFile.content);
        const updatedFile = {
            ...selectedFile,
            content: cleaned,
            tokens: estimateTokens(cleaned)
        };
        setSelectedFile(updatedFile);
        setIngestedFiles(prev => prev.map(f => f.path === selectedFile.path ? updatedFile : f));
        toast.success("Content cleaned up intelligently");
    };

    const handleChat = async () => {
        if (!chatInput.trim() || isChatting || ingestedFiles.length === 0) return;

        const userMessage = chatInput;
        setChatInput("");
        setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsChatting(true);

        const apiKey = geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        if (!apiKey) {
            toast.error("Please configure your Gemini API Key in Settings to use Chat.");
            setIsChatting(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: `Context: Here is the ingested data:\n\n${ingestedFiles.map(f => `FILE: ${f.path}\nCONTENT: ${f.content}`).join("\n\n")}` },
                            { text: `Question: ${userMessage}` }
                        ]
                    }
                ],
                config: {
                    systemInstruction: "You are Ingestor Pro AI. You help users understand and process their ingested data. Use the provided context to answer questions accurately.",
                }
            });

            setChatMessages(prev => [...prev, { role: "assistant", content: response.text || "I couldn't process that." }]);
        } catch (err: any) {
            toast.error("Chat error: " + err.message);
            setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error while processing your request." }]);
        } finally {
            setIsChatting(false);
        }
    };

    const addToHistory = (files: IngestedFile[], source: string, type: "folder" | "url") => {
        const totalTokens = files.reduce((acc, f) => acc + f.tokens, 0);
        const totalSize = files.reduce((acc, f) => acc + f.size, 0);

        const newHistoryItem: IngestionHistory = {
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            source,
            type,
            files,
            totalTokens,
            totalSize
        };

        setHistory(prev => [newHistoryItem, ...prev]);
    };

    const copyAllContent = () => {
        const fullContent = ingestedFiles.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n");
        navigator.clipboard.writeText(fullContent);
        toast.success("All content copied to clipboard");
    };

    const downloadAllContent = () => {
        const fullContent = ingestedFiles.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n");
        const blob = new Blob([fullContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ingested_data_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Content downloaded as .txt file");
    };

    const filteredFiles = ingestedFiles.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalTokens = ingestedFiles.reduce((acc, f) => acc + f.tokens, 0);
    const totalSize = ingestedFiles.reduce((acc, f) => acc + f.size, 0);

    return (
        <TooltipProvider>
            <div className={cn(
                "flex h-screen w-full overflow-hidden transition-colors duration-300",
                isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900"
            )}>
                <Toaster position="top-right" theme={isDarkMode ? "dark" : "light"} />

                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                    hasFiles={ingestedFiles.length > 0}
                    onNewIngestion={() => {
                        setIngestedFiles([]);
                        setSelectedFile(null);
                        setCurrentSource(null);
                        setActiveTab("ingest");
                        toast.info("Started new ingestion session");
                    }}
                />

                <main className="flex-1 overflow-hidden flex flex-col">
                    <header className="flex h-16 items-center justify-between border-b border-white/10 px-8 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-medium">
                                {activeTab === "ingest" ? "Workspace" : activeTab === "history" ? "Ingestion History" : activeTab === "chat" ? "Chat with Data" : "Settings"}
                            </h2>
                            {ingestedFiles.length > 0 && activeTab === "ingest" && (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                    {ingestedFiles.length} Files
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {ingestedFiles.length > 0 && activeTab === "ingest" && (
                                <>
                                    <Button variant="outline" size="sm" onClick={copyAllContent} className="gap-2">
                                        <Copy size={16} /> Copy All
                                    </Button>
                                    <Button size="sm" onClick={downloadAllContent} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white border-none">
                                        <Download size={16} /> Download
                                    </Button>
                                </>
                            )}
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto p-8">
                        <AnimatePresence mode="wait">
                            {activeTab === "ingest" && (
                                <Workspace
                                    key="ingest"
                                    ingestedFiles={ingestedFiles}
                                    setIngestedFiles={setIngestedFiles}
                                    selectedFile={selectedFile}
                                    setSelectedFile={setSelectedFile}
                                    ingestingTarget={ingestingTarget}
                                    url={url}
                                    setUrl={setUrl}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                    currentSource={currentSource}
                                    setCurrentSource={setCurrentSource}
                                    fileInputRef={fileInputRef}
                                    singleFileInputRef={singleFileInputRef}
                                    handleFolderSelect={handleFolderSelect}
                                    handleSingleFileSelect={handleSingleFileSelect}
                                    handleUrlScrape={handleUrlScrape}
                                    handleCleanup={handleCleanup}
                                    totalTokens={totalTokens}
                                    totalSize={totalSize}
                                    formatBytes={formatBytes}
                                />
                            )}

                            {activeTab === "history" && (
                                <History
                                    key="history"
                                    history={history}
                                    setHistory={setHistory}
                                    onLoadHistory={(item) => {
                                        setIngestedFiles(item.files);
                                        setSelectedFile(item.files[0] || null);
                                        setCurrentSource(item.source);
                                        setActiveTab("ingest");
                                    }}
                                    formatBytes={formatBytes}
                                />
                            )}

                            {activeTab === "chat" && (
                                <Chat
                                    key="chat"
                                    messages={chatMessages}
                                    chatInput={chatInput}
                                    setChatInput={setChatInput}
                                    isChatting={isChatting}
                                    onSendMessage={handleChat}
                                    ingestedFiles={ingestedFiles}
                                />
                            )}

                            {activeTab === "graph" && (
                                <Graph
                                    key="graph"
                                    currentFiles={ingestedFiles}
                                    history={history}
                                />
                            )}

                            {activeTab === "settings" && (
                                <Settings
                                    key="settings"
                                    isDarkMode={isDarkMode}
                                    setIsDarkMode={setIsDarkMode}
                                    onClearHistory={() => {
                                        setHistory([]);
                                        localStorage.removeItem("ingestor_history");
                                        toast.success("History cleared");
                                    }}
                                    ignorePatterns={ignorePatterns}
                                    setIgnorePatterns={setIgnorePatterns}
                                    defaultIgnorePatterns={DEFAULT_IGNORE_PATTERNS}
                                    geminiApiKey={geminiApiKey}
                                    setGeminiApiKey={setGeminiApiKey}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}
