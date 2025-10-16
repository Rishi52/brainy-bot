import { useEffect, useRef } from "react";
import { Message } from "@/pages/Chat";
import { Bot, User, Loader2, Brain, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useState } from "react";
import { toast } from "sonner";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <ScrollArea className="h-full w-full bg-gradient-to-b from-background/50 to-background">
      <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-full pb-4">
        {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary via-purple-500 to-accent rounded-full shadow-glow">
              <Brain className="h-12 w-12 text-white animate-pulse" />
              <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-2 -right-2 animate-spin" />
            </div>
          </div>
          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to BrainyBot!
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed px-4">
              Your AI study companion is ready to help! Ask questions, upload images, 
              or use voice input - I'll provide detailed explanations to enhance your learning.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground/80 mt-4 sm:mt-6">
              <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-card/50 border border-border/50">
                <span>💬</span> <span className="hidden xs:inline">Text conversations</span><span className="xs:hidden">Text</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-card/50 border border-border/50">
                <span>🎤</span> <span className="hidden xs:inline">Voice input</span><span className="xs:hidden">Voice</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-card/50 border border-border/50">
                <span>📸</span> <span className="hidden xs:inline">Image analysis</span><span className="xs:hidden">Image</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-card/50 border border-border/50">
                <span>📚</span> <span className="hidden xs:inline">Subject expertise</span><span className="xs:hidden">Subjects</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 animate-fade-in group ${
            message.role === "assistant" ? "justify-start" : "justify-end"
          }`}
        >
          {message.role === "assistant" && (
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 shadow-soft">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          )}

          <div className="flex flex-col max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
            <div
              className={`relative rounded-2xl p-3 sm:p-4 shadow-soft transition-smooth ${
                message.role === "assistant"
                  ? "bg-card/80 border border-border/50 backdrop-blur-sm"
                  : "gradient-primary text-primary-foreground shadow-glow"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code: ({ className, children, ...props }) => {
                        const isInline = !className?.includes('language-');
                        return isInline ? (
                          <code
                            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <div className="relative group/code">
                            <pre className="bg-muted/50 border border-border/50 rounded-lg p-3 overflow-x-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
              )}
              
              {message.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  {copiedId === message.id ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
            
            <div className={`flex items-center gap-2 mt-1 px-2 ${
              message.role === "assistant" ? "justify-start" : "justify-end"
            }`}>
              <span className="text-xs text-muted-foreground/70">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {message.input_type && message.input_type !== "text" && (
                <>
                  <span className="text-xs text-muted-foreground/50">•</span>
                  <span className="text-xs text-muted-foreground/70 capitalize flex items-center gap-1">
                    {message.input_type === "voice" && "🎤"}
                    {message.input_type === "image" && "📸"}
                    via {message.input_type}
                  </span>
                </>
              )}
            </div>
          </div>

          {message.role === "user" && (
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center border border-accent/20 shadow-soft">
              <User className="h-5 w-5 text-accent" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-4 animate-fade-in">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 shadow-soft">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="bg-card/80 border border-border/50 backdrop-blur-sm rounded-2xl p-4 shadow-soft max-w-[85%] md:max-w-[75%]">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground animate-typing">
                  Thinking
                </span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
