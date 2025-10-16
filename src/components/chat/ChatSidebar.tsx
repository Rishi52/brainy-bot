import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Trash2, 
  Plus, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  updated_at: string;
  preview?: string;
}

interface ChatSidebarProps {
  userId: string;
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

const ChatSidebar = ({
  userId,
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isCollapsed,
  onToggleCollapse,
  isMobile,
}: ChatSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const subjectEmojis = {
    general: "🎯",
    math: "🔢", 
    science: "🧪",
    coding: "💻",
    history: "📚",
    language: "🌍"
  } as const;

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("chat_conversations")
        .select(`
          id,
          title,
          subject,
          created_at,
          updated_at,
          chat_messages (
            content,
            role,
            created_at
          )
        `)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const conversationsWithPreview = data.map((conv: { id: string; title: string; subject: string; created_at: string; updated_at: string; chat_messages?: { role: string; content: string }[] }) => {
        const firstUserMsg = conv.chat_messages?.find((msg: { role: string; content: string }) => msg.role === "user");
        let preview: string;
        if (firstUserMsg?.content) {
          const snippet = firstUserMsg.content.substring(0, 60);
          preview = snippet + (firstUserMsg.content.length > 60 ? "..." : "");
        } else {
          preview = "No messages yet";
        }
        return { ...conv, preview };
      });

      setConversations(conversationsWithPreview);
    } catch (error) {
      toast.error("Failed to load conversations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const deleteConversation = async (id: string) => {
    try {
      setDeletingId(id);

      // Explicitly delete messages first (not strictly necessary because of ON DELETE CASCADE
      // in the database schema, but done here for clarity and to allow potential future hooks).
      const { error: msgError } = await supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", id);
      if (msgError) throw msgError;

      // Delete the conversation itself (will also cascade if messages remain).
      const { error: convError } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (convError) throw convError;

      setConversations(prev => prev.filter(conv => conv.id !== id));
      toast.success("Conversation and messages deleted");

      // If we deleted the current conversation, start a new one
      if (id === currentConversationId) {
        onNewConversation();
      }
    } catch (error) {
      toast.error("Failed to delete conversation");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId, loadConversations]);

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const dateKey = formatDate(conv.updated_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  // Don't show collapsed view on mobile - always show full sidebar when visible
  if (isCollapsed && !isMobile) {
    return (
      <div className="w-16 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col items-center py-4 gap-4">
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={onNewConversation}
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10"
          title="New conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          {conversations.slice(0, 8).map((conv) => (
            <Button
              key={conv.id}
              onClick={() => onConversationSelect(conv.id)}
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-primary/10 h-8 w-8 text-xs",
                currentConversationId === conv.id && "bg-primary/20"
              )}
              title={conv.title}
            >
              {subjectEmojis[conv.subject as keyof typeof subjectEmojis] || "💬"}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'w-full h-dvh' : 'w-80 h-dvh'} bg-card/50 backdrop-blur-xl ${!isMobile ? 'border-r border-border/50' : ''} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg gradient-primary bg-clip-text text-transparent">
            Chat History
          </h2>
          {!isMobile && (
            <Button
              onClick={onToggleCollapse}
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onNewConversation}
            className="flex-1 gradient-primary shadow-soft"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 pb-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedConversations).map(([dateKey, convs]) => (
                <div key={dateKey}>
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {dateKey}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {convs.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-primary/5 hover:shadow-soft border border-transparent hover:border-primary/20",
                          currentConversationId === conversation.id && "bg-primary/10 border-primary/30 shadow-soft"
                        )}
                        onClick={() => onConversationSelect(conversation.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">
                                {subjectEmojis[conversation.subject as keyof typeof subjectEmojis] || "💬"}
                              </span>
                              <h3 className="font-medium text-sm truncate">
                                {conversation.title}
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {conversation.preview}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.updated_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === conversation.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {filteredConversations.length === 0 && !loading && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchQuery ? "Try a different search term" : "Start a new conversation to get started"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;