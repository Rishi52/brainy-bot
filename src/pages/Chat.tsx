import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { toast } from "sonner";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  input_type?: "text" | "voice" | "image";
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const createNewConversation = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: userId,
          title: "New Conversation",
          subject: subject,
        })
        .select()
        .single();

      if (error) throw error;
      setConversationId(data.id);
      setMessages([]); // Clear messages for new conversation
    } catch (error) {
      toast.error("Failed to create conversation");
      console.error(error);
    }
  }, [subject]);

  const loadConversation = useCallback(async (convId: string) => {
    try {
      // Load messages for the selected conversation
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        input_type: msg.input_type as "text" | "voice" | "image",
        created_at: msg.created_at,
      }));

      setMessages(formattedMessages);
      setConversationId(convId);

      // Update conversation title based on first message if it's still "New Conversation"
      if (formattedMessages.length > 0) {
        const { data: convData } = await supabase
          .from("chat_conversations")
          .select("title")
          .eq("id", convId)
          .single();

        if (convData?.title === "New Conversation") {
          const firstUserMessage = formattedMessages.find(msg => msg.role === "user");
          if (firstUserMessage) {
            const newTitle = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "");
            await supabase
              .from("chat_conversations")
              .update({ title: newTitle })
              .eq("id", convId);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load conversation");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    // On mount, get session and then decide whether to load an existing conversation or create a new one.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);

      // Fetch latest existing conversation for user
      const { data: existingConvs, error: convErr } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (convErr) {
        console.error(convErr);
        toast.error("Failed to load conversations");
        return createNewConversation(session.user.id);
      }

      if (existingConvs && existingConvs.length > 0) {
        // Load that conversation's messages
        loadConversation(existingConvs[0].id);
      } else {
        // None exist; create one
        createNewConversation(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, createNewConversation, loadConversation]);

  const handleSendMessage = async (content: string, inputType: "text" | "voice" | "image" = "text", imageData?: string) => {
    if (!conversationId || !session) return;

    setIsLoading(true);
    
    // For image input, show placeholder
    const displayContent = inputType === "image" ? "[Image uploaded for analysis]" : content;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: displayContent,
      input_type: inputType,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Save user message to database
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: displayContent,
        input_type: inputType,
      });

      // Prepare payload for edge function
      const payload: any = {
        message: content,
        subject: subject,
        conversationId: conversationId,
      };

      // Include image data if present
      if (inputType === "image" && imageData) {
        payload.imageData = imageData;
      }

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: payload,
      });

      if (error) throw error;

      const aiResponse = data.response;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponse,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
      });

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const newTitle = displayContent.substring(0, 50) + (displayContent.length > 50 ? "..." : "");
        await supabase
          .from("chat_conversations")
          .update({ 
            title: newTitle,
            updated_at: new Date().toISOString()
          })
          .eq("id", conversationId);
      } else {
        await supabase
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      }
      
      if (inputType === "image") {
        toast.success("✅ Image analyzed successfully!");
      }
    } catch (error) {
      toast.error("Failed to get response");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!session) return null;

  return (
    <div className="flex h-dvh w-full bg-gradient-to-br from-background via-background/95 to-background/90 overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
          onTouchEnd={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
          }}
        />
      )}
      
      {/* Sidebar - Hidden on mobile unless menu is open */}
      <div className={`${
        isMobile 
          ? mobileMenuOpen 
            ? 'fixed inset-y-0 left-0 z-50 w-full max-w-[85vw] sm:max-w-xs' 
            : 'hidden'
          : sidebarCollapsed 
            ? 'w-16' 
            : 'w-80'
      } transition-all duration-300 ease-in-out md:relative bg-card/95 backdrop-blur-xl shadow-2xl md:shadow-none`}>
        <ChatSidebar
          userId={session.user.id}
          currentConversationId={conversationId}
          onConversationSelect={(id) => {
            loadConversation(id);
            if (isMobile) setMobileMenuOpen(false);
          }}
          onNewConversation={() => {
            createNewConversation(session.user.id);
            if (isMobile) setMobileMenuOpen(false);
          }}
          isCollapsed={isMobile ? false : sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
        <ChatHeader
          subject={subject}
          onSubjectChange={setSubject}
          onSignOut={handleSignOut}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobile={isMobile}
        />
        <div className="flex-1 flex justify-center min-h-0 overflow-hidden">
          <div className="w-full max-w-4xl flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 px-2 md:px-4 overflow-hidden">
              <ChatMessages messages={messages} isLoading={isLoading} />
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 border-t border-border/20">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
