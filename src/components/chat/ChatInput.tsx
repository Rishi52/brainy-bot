import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Image as ImageIcon, Send, StopCircle } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (content: string, inputType?: "text" | "voice" | "image", imageData?: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !pendingImage) || disabled) return;

    if (pendingImage) {
      onSendMessage(input.trim() || "Analyze this image", "image", pendingImage);
      setPendingImage(null);
      setImagePreview(null);
    } else {
      onSendMessage(input.trim(), "text");
    }
    setInput("");
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      toast.info("Please wait for speech recognition to complete or say something.");
      return;
    }

    try {
      // Check for microphone permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setIsRecording(true);
      toast.success("🎤 Listening... Speak clearly!");

      // Use browser's native speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition not supported in this browser");
        setIsRecording(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        
        if (transcript.trim()) {
          toast.success("✅ Voice transcribed! Review and send.");
          setInput(transcript);
        } else {
          toast.error("No speech detected. Please try again.");
        }
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        console.error("Speech recognition error:", event.error);
        toast.error(`Speech recognition failed: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      setIsRecording(false);
      console.error("Microphone access error:", error);
      toast.error("Microphone access denied. Please allow microphone permissions and try again.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please choose an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result?.toString();
      if (!base64Image) return;

      toast.success("📸 Image ready! Add a message and press send.");
      setPendingImage(base64Image);
      setImagePreview(base64Image);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
      <div className="w-full bg-transparent transition-smooth">
        <div className="p-2 sm:p-3 md:p-4 max-w-4xl mx-auto">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-h-20 rounded-lg border border-border/50" />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setPendingImage(null);
                toast.info("Image removed");
              }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90"
            >
              ✕
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-2 sm:p-2.5 shadow-lg hover:bg-card/50 hover:border-border/40 transition-all duration-300">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-shrink-0 transition-smooth hover:bg-accent/10 hover:text-accent h-9 w-9 sm:h-10 sm:w-10 border-0"
              title="Upload image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              disabled={disabled}
              className={`flex-shrink-0 transition-smooth h-9 w-9 sm:h-10 sm:w-10 border-0 ${
                isRecording 
                  ? "bg-destructive/20 text-destructive" 
                  : "hover:bg-primary/10 hover:text-primary"
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
                placeholder="Ask me anything... 💡"
                className="min-h-[38px] sm:min-h-[42px] md:min-h-[44px] max-h-[100px] sm:max-h-[120px] md:max-h-[150px] resize-none pr-12 text-xs sm:text-sm transition-smooth focus:ring-1 focus:ring-primary/20 border-0 bg-transparent placeholder:text-muted-foreground/50 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={disabled}
            />
            <div className="absolute bottom-1.5 right-2 flex items-center gap-0.5 text-[10px] sm:text-xs text-muted-foreground/40">
              <span>{input.length}</span>
              <span>/</span>
              <span>2000</span>
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={(!input.trim() && !pendingImage) || disabled}
          className="flex-shrink-0 gradient-primary shadow-md hover:shadow-lg transition-smooth h-[38px] w-[38px] sm:h-[42px] sm:w-[42px] rounded-xl"
            title="Send message"
          >
          <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 text-[10px] sm:text-xs text-muted-foreground/50 gap-1.5">
          <p className="hidden sm:block">Press Enter to send, Shift+Enter for new line</p>
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <span className="flex items-center gap-0.5 sm:gap-1">
              <span>💬</span> <span className="hidden xs:inline">Text</span>
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1">
              <span>🎤</span> <span className="hidden xs:inline">Voice</span>
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1">
              <span>📸</span> <span className="hidden xs:inline">Image</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
