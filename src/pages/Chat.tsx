import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
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
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);
      createNewConversation(session.user.id);
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
  }, [navigate]);

  const createNewConversation = async (userId: string) => {
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
    } catch (error: any) {
      toast.error("Failed to create conversation");
      console.error(error);
    }
  };

  const handleSendMessage = async (content: string, inputType: "text" | "voice" | "image" = "text") => {
    if (!conversationId || !session) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      input_type: inputType,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Save user message to database
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content,
        input_type: inputType,
      });

      // Call AI function
      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: {
          message: content,
          subject,
          conversationId,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: data.response,
      });
    } catch (error: any) {
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
    <div className="flex flex-col h-screen max-w-5xl mx-auto">
      <ChatHeader
        subject={subject}
        onSubjectChange={setSubject}
        onSignOut={handleSignOut}
      />
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Chat;
