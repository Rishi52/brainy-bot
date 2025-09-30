import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Image as ImageIcon, Send, StopCircle } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (content: string, inputType?: "text" | "voice" | "image") => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSendMessage(input.trim(), "text");
    setInput("");
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(",")[1];
          if (!base64Audio) return;

          // Note: Voice-to-text functionality will be implemented via edge function
          toast.info("Voice transcription coming soon!");
        };

        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      toast.success("Recording started!");
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error(error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result?.toString();
      if (!base64Image) return;

      // Note: Image processing will be implemented via edge function
      toast.info("Image processing coming soon!");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="sticky bottom-0 border-t bg-card/80 backdrop-blur-lg p-4 shadow-soft">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleVoiceInput}
          disabled={disabled}
          className={`flex-shrink-0 ${isRecording ? "bg-destructive text-destructive-foreground" : ""}`}
        >
          {isRecording ? (
            <StopCircle className="h-4 w-4 animate-pulse" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything... (type, speak, or upload an image)"
          className="min-h-[60px] max-h-[200px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled}
        />

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || disabled}
          className="flex-shrink-0 gradient-primary shadow-glow"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;
