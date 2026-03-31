import { motion, AnimatePresence } from "motion/react";
import {
  FolderOpen,
  FileText,
  Globe,
  Loader2,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsBar } from "./StatsBar";
import { FileExplorer } from "./FileExplorer";
import { ContentViewer } from "./ContentViewer";
import { IngestedFile } from "@/lib/types";

interface WorkspaceProps {
  ingestedFiles: IngestedFile[];
  setIngestedFiles: (files: IngestedFile[]) => void;
  selectedFile: IngestedFile | null;
  setSelectedFile: (file: IngestedFile | null) => void;
  ingestingTarget: "folder" | "file" | "url" | null;
  url: string;
  setUrl: (url: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "list" | "tree";
  setViewMode: (mode: "list" | "tree") => void;
  currentSource: string | null;
  setCurrentSource: (source: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  singleFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFolderSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSingleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUrlScrape: () => void;
  handleCleanup: () => void;
  totalTokens: number;
  totalSize: number;
  formatBytes: (bytes: number) => string;
}

export function Workspace({
  ingestedFiles,
  setIngestedFiles,
  selectedFile,
  setSelectedFile,
  ingestingTarget,
  url,
  setUrl,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  currentSource,
  setCurrentSource,
  fileInputRef,
  singleFileInputRef,
  handleFolderSelect,
  handleSingleFileSelect,
  handleUrlScrape,
  handleCleanup,
  totalTokens,
  totalSize,
  formatBytes
}: WorkspaceProps) {
  const filteredFiles = ingestedFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      key="ingest"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {ingestedFiles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10 hover:border-orange-500/50 transition-all cursor-pointer group relative overflow-hidden" onClick={() => fileInputRef.current?.click()}>
            {ingestingTarget === "folder" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-orange-500" size={32} />
                <p className="text-sm font-medium">Ingesting...</p>
              </div>
            )}
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FolderOpen className="text-orange-500" />
              </div>
              <CardTitle>Local Folder</CardTitle>
              <CardDescription>Ingest an entire codebase or directory.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                /* @ts-ignore */
                webkitdirectory=""
                directory=""
                onChange={handleFolderSelect}
              />
              <Button variant="secondary" className="w-full">Select Directory</Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all cursor-pointer group relative overflow-hidden" onClick={() => singleFileInputRef.current?.click()}>
            {ingestingTarget === "file" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-green-500" size={32} />
                <p className="text-sm font-medium">Ingesting...</p>
              </div>
            )}
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="text-green-500" />
              </div>
              <CardTitle>Single Files</CardTitle>
              <CardDescription>Upload individual text, code, or markdown files.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={singleFileInputRef}
                className="hidden"
                multiple
                onChange={handleSingleFileSelect}
              />
              <Button variant="secondary" className="w-full">Select Files</Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all relative overflow-hidden">
            {ingestingTarget === "url" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-sm font-medium">Scraping...</p>
              </div>
            )}
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Globe className="text-blue-500" />
              </div>
              <CardTitle>Web Content</CardTitle>
              <CardDescription>Scrape content from any URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="https://example.com/docs"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-black/20 border-white/10"
              />
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none"
                onClick={handleUrlScrape}
                disabled={ingestingTarget === "url" || !url}
              >
                {ingestingTarget === "url" ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {ingestingTarget === "url" ? "Scraping..." : "Scrape URL"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <StatsBar
            totalTokens={totalTokens}
            totalSize={totalSize}
            filesCount={ingestedFiles.length}
            formatBytes={formatBytes}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <FileExplorer
              files={ingestedFiles}
              filteredFiles={filteredFiles}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              currentSource={currentSource}
              onClearWorkspace={() => {
                setIngestedFiles([]);
                setSelectedFile(null);
                setCurrentSource(null);
              }}
            />

            {selectedFile && (
              <ContentViewer
                selectedFile={selectedFile}
                onClose={() => setSelectedFile(null)}
                onCleanup={handleCleanup}
                formatBytes={formatBytes}
              />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
