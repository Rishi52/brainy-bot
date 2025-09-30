import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, LogOut, Sparkles } from "lucide-react";

interface ChatHeaderProps {
  subject: string;
  onSubjectChange: (subject: string) => void;
  onSignOut: () => void;
}

const ChatHeader = ({ subject, onSubjectChange, onSignOut }: ChatHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-lg shadow-soft">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary" />
            <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              BrainyBot
            </h1>
            <p className="text-xs text-muted-foreground">AI Study Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={subject} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="language">Language</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
