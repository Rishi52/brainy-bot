import { useEffect, useRef } from "react";
import { Message } from "@/pages/Chat";
import { Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="relative">
            <Bot className="h-20 w-20 text-primary/20" />
            <span className="absolute inset-0 flex items-center justify-center text-4xl">
              🧠
            </span>
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome to BrainyBot!
            </h2>
            <p className="text-muted-foreground">
              Ask me any question - type, speak, or upload an image. I'll provide
              step-by-step solutions to help you learn!
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 animate-fade-in ${
            message.role === "assistant" ? "justify-start" : "justify-end"
          }`}
        >
          {message.role === "assistant" && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          )}

          <div
            className={`max-w-[80%] rounded-2xl p-4 shadow-soft ${
              message.role === "assistant"
                ? "bg-card border border-border"
                : "gradient-primary text-primary-foreground"
            }`}
          >
            {message.role === "assistant" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
            {message.input_type && message.input_type !== "text" && (
              <span className="text-xs opacity-70 mt-2 block">
                via {message.input_type}
              </span>
            )}
          </div>

          {message.role === "user" && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="h-5 w-5 text-accent" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 animate-fade-in">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground animate-typing">
                Thinking...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
