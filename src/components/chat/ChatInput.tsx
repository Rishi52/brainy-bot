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
      // If already recording, we can't stop it manually with this implementation
      toast.info("Please wait for speech recognition to complete or say something.");
      return;
    }

    try {
      // Check for microphone permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const { geminiService } = await import("@/lib/gemini");
      
      if (!geminiService.isInitialized()) {
        toast.error("AI service not configured. Please add your API key in settings.");
        return;
      }

      setIsRecording(true);
      toast.success("🎤 Listening... Speak clearly!");

      try {
        const transcript = await geminiService.startSpeechRecognition();
        setIsRecording(false);
        
        if (transcript.trim()) {
          toast.success("✅ Voice message transcribed!");
          onSendMessage(transcript, "voice");
        } else {
          toast.error("No speech detected. Please try again.");
        }
      } catch (error) {
        setIsRecording(false);
        console.error("Speech recognition error:", error);
        const errorMessage = error instanceof Error ? error.message : "Speech recognition failed";
        toast.error(errorMessage);
      }
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

    try {
      const { geminiService } = await import("@/lib/gemini");
      
      if (!geminiService.isVisionEnabled()) {
        toast.error("Image analysis not available. Please check your API configuration.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result?.toString();
        if (!base64Image) return;

        try {
          toast.info("🔍 Analyzing image with AI...");
          
          // Send image with a descriptive prompt
          const prompt = "What do you see in this image? Please provide a detailed description and if it contains any text, diagrams, or educational content, explain it in detail.";
          const description = await geminiService.generateResponseFromImage(base64Image, prompt);
          
          // Send the image description as a message
          onSendMessage(`[Image Analysis]\n\n${description}`, "image");
          toast.success("✅ Image analyzed successfully!");
          
        } catch (error) {
          console.error("Image analysis error:", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to analyze image";
          
          if (errorMessage.includes('API key')) {
            toast.error("API key issue. Please check your Gemini API configuration.");
          } else if (errorMessage.includes('quota')) {
            toast.error("API quota exceeded. Please check your Gemini API limits.");
          } else {
            toast.error(`Image analysis failed: ${errorMessage}`);
          }
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to process image");
    }

    // Reset the file input
    e.target.value = "";
  };

  return (
      <div className="w-full bg-card/80 backdrop-blur-xl shadow-soft transition-smooth">
        <div className="p-2 sm:p-3 md:p-4 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="flex gap-1 md:gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-shrink-0 transition-smooth hover:bg-accent/10 hover:border-accent/30 hover:text-accent h-10 w-10 md:h-11 md:w-11"
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
              className={`flex-shrink-0 transition-smooth h-10 w-10 md:h-11 md:w-11 ${
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
                placeholder="Ask me anything... 💡"
                className="min-h-[44px] sm:min-h-[48px] md:min-h-[56px] max-h-[120px] sm:max-h-[150px] md:max-h-[200px] resize-none pr-12 text-sm md:text-base transition-smooth focus:ring-2 focus:ring-primary/20 border-border/50 bg-background/60 backdrop-blur-sm rounded-xl"
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
          className="flex-shrink-0 gradient-primary shadow-glow hover:shadow-glow/80 transition-smooth h-[44px] w-11 sm:h-[48px] sm:w-12 md:h-[56px] md:w-14 rounded-xl"
            title="Send message"
          >
          <Send className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-0.5" />
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 md:mt-3 text-xs text-muted-foreground/70 gap-2">
          <p className="hidden sm:block">Press Enter to send, Shift+Enter for new line</p>
          <div className="flex items-center justify-center sm:justify-end gap-3">
            <span className="flex items-center gap-1">
              <span>💬</span> <span className="hidden xs:inline">Text</span>
            </span>
            <span className="flex items-center gap-1">
              <span>🎤</span> <span className="hidden xs:inline">Voice</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📸</span> <span className="hidden xs:inline">Image</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
