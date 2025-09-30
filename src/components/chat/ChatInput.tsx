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
    <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur-xl shadow-soft transition-smooth">
      <div className="p-4 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-shrink-0 transition-smooth hover:bg-accent/10 hover:border-accent/30 hover:text-accent"
              title="Upload image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              disabled={disabled}
              className={`flex-shrink-0 transition-smooth ${
                isRecording 
                  ? "bg-destructive text-destructive-foreground border-destructive shadow-glow" 
                  : "hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
              }`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? (
                <StopCircle className="h-4 w-4 animate-pulse" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything... I'm here to help you learn! 💡"
              className="min-h-[60px] max-h-[200px] resize-none pr-12 transition-smooth focus:ring-2 focus:ring-primary/20 border-border/50 bg-background/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={disabled}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-muted-foreground/70">
              <span>{input.length}</span>
              <span>/</span>
              <span>2000</span>
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || disabled}
            className="flex-shrink-0 gradient-primary shadow-glow hover:shadow-glow/80 transition-smooth h-[60px] w-12"
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground/70">
          <p>Press Enter to send, Shift+Enter for new line</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span>💬</span> Text
            </span>
            <span className="flex items-center gap-1">
              <span>🎤</span> Voice
            </span>
            <span className="flex items-center gap-1">
              <span>📸</span> Image
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
