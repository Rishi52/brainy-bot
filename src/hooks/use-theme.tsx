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
    // We want dark by default regardless of system unless explicitly saved
    return "dark";
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

  // (Optional) If you'd like to still respect system changes when user hasn't chosen manually, keep the listener.
  // Currently disabled to keep dark as the persistent default when unset.

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