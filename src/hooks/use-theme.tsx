import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if we have a saved theme in localStorage
    const savedTheme = localStorage.getItem("brainybot-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    
    return "light";
  });

  const setThemeAndSave = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("brainybot-theme", newTheme);
  };

  const toggleTheme = () => {
    setThemeAndSave(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no theme is explicitly saved
      if (!localStorage.getItem("brainybot-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    setTheme: setThemeAndSave,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};