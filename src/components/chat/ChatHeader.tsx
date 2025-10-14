import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThemeToggle from "@/components/ui/theme-toggle";
import SettingsDialog from "@/components/ui/settings-dialog";
import { Brain, LogOut, Sparkles, BookOpen, Menu } from "lucide-react";

interface ChatHeaderProps {
  subject: string;
  onSubjectChange: (subject: string) => void;
  onSignOut: () => void;
}

const ChatHeader = ({ subject, onSubjectChange, onSignOut }: ChatHeaderProps) => {
  const subjectIcons = {
    general: "🎯",
    math: "🔢", 
    science: "🧪",
    coding: "💻",
    history: "📚",
    language: "🌍"
  } as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl shadow-soft transition-smooth">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl shadow-glow animate-pulse-glow">
              <Brain className="h-6 w-6 text-white" />
              <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              BrainyBot
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              AI Study Companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Select value={subject} onValueChange={onSubjectChange}>
                <SelectTrigger className="w-[200px] transition-smooth hover:bg-accent/5 bg-background/50 border-border/50">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border">
                <SelectItem value="general" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>{subjectIcons.general}</span>
                    General
                  </span>
                </SelectItem>
                <SelectItem value="math" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>{subjectIcons.math}</span>
                    Mathematics
                  </span>
                </SelectItem>
                <SelectItem value="science" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>{subjectIcons.science}</span>
                    Science
                  </span>
                </SelectItem>
                <SelectItem value="coding" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>{subjectIcons.coding}</span>
                    Programming
                  </span>
                </SelectItem>
                <SelectItem value="history" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>{subjectIcons.history}</span>
                    History
                  </span>
                </SelectItem>
                <SelectItem value="language" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>{subjectIcons.language}</span>
                    Language
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SettingsDialog />
          
          <ThemeToggle />

          <Button 
            variant="outline" 
            size="icon" 
            onClick={onSignOut}
              className="transition-smooth hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-background/50 border-border/50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
