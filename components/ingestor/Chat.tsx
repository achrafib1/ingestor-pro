import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  Bot,
  Copy,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatMessage, IngestedFile } from "@/lib/types";
import { toast } from "sonner";

interface ChatProps {
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  isChatting: boolean;
  onSendMessage: () => void;
  ingestedFiles: IngestedFile[];
}

export function Chat({
  messages,
  chatInput,
  setChatInput,
  isChatting,
  onSendMessage,
  ingestedFiles
}: ChatProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6"
    >
      <Card className="flex-1 bg-white/5 border-white/10 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                <MessageSquare size={20} />
              </div>
              <div>
                <CardTitle>Chat with Data</CardTitle>
                <CardDescription>Ask questions about your ingested files.</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              {ingestedFiles.length} Files in Context
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-white/40">
                <Bot size={48} className="mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">How can I help you?</h3>
                <p className="max-w-md text-sm">
                  I have access to all your ingested files. You can ask me to summarize them,
                  find specific information, or explain complex parts of the code.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      msg.role === "user" ? "bg-orange-500 text-white" : "bg-white/10 text-white/60"
                    )}>
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={cn(
                      "relative group p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-orange-500 text-white rounded-tr-none"
                        : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                    )}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            toast.success("Message copied");
                          }}
                        >
                          <Copy size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex gap-4 mr-auto">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-white/60" />
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                      <Loader2 size={16} className="animate-spin text-orange-500" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-6 bg-black/20 border-t border-white/10">
            <div className="flex gap-3">
              <Input
                placeholder={ingestedFiles.length > 0 ? "Ask a question about your data..." : "Ingest files first to start chatting"}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatting || ingestedFiles.length === 0}
                className="bg-black/20 border-white/10 h-12"
              />
              <Button
                onClick={onSendMessage}
                disabled={isChatting || !chatInput.trim() || ingestedFiles.length === 0}
                className="h-12 w-12 bg-orange-600 hover:bg-orange-700 text-white border-none p-0"
              >
                {isChatting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
