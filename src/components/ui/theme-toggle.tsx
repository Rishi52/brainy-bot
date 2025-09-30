import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative transition-smooth hover:bg-accent/10"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <Sun className={`h-4 w-4 transition-all duration-300 ${
        theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
      }`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-300 ${
        theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
      }`} />
    </Button>
  );
};

export default ThemeToggle;