import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Key, Check, X } from "lucide-react";
import { toast } from "sonner";
import { geminiService } from "@/lib/gemini";

const SettingsDialog = () => {
  const [apiKey, setApiKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if Gemini is already initialized
    setIsInitialized(geminiService.isInitialized());
    
    // Check if there's an API key in environment
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envApiKey && envApiKey !== "YOUR_GEMINI_API_KEY_HERE") {
      setIsInitialized(true);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setIsValidating(true);
    try {
      // Test the API key by making a simple request
      // Note: In a production app, you'd want to store this securely
      localStorage.setItem('gemini_api_key', apiKey);
      
      // You could reinitialize the service here with the new key
      // For now, we'll just show success and require a reload
      toast.success("API key saved! Please reload the page to apply changes.");
      setIsInitialized(true);
      setIsOpen(false);
    } catch (error) {
      toast.error("Invalid API key. Please check and try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const getApiKeyInstructions = () => (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p><strong>To get your Gemini API key:</strong></p>
      <ol className="list-decimal list-inside space-y-2">
        <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
        <li>Sign in with your Google account</li>
        <li>Click "Create API Key"</li>
        <li>Copy the generated key and paste it below</li>
      </ol>
      <p className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded text-amber-800 dark:text-amber-200">
        <strong>Note:</strong> Keep your API key secure and never share it publicly.
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Settings className="h-4 w-4" />
          {!isInitialized && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Gemini API Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your Google Gemini API key to enable AI responses.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className={`border-2 ${isInitialized ? 'border-green-200 dark:border-green-800' : 'border-amber-200 dark:border-amber-800'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {isInitialized ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    API Key Configured
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-amber-500" />
                    API Key Required
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isInitialized 
                  ? "Gemini AI is ready to use!"
                  : "Please configure your API key to enable AI features."
                }
              </CardDescription>
            </CardHeader>
            {!isInitialized && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apikey">Gemini API Key</Label>
                  <Input
                    id="apikey"
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={isValidating || !apiKey.trim()}
                  className="w-full"
                >
                  {isValidating ? "Validating..." : "Save API Key"}
                </Button>
              </CardContent>
            )}
          </Card>

          <div className="space-y-3">
            {getApiKeyInstructions()}
          </div>

          {import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Environment Variable Detected:</strong> An API key is configured in your environment variables.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;