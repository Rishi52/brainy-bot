# Gemini API Integration Guide

## Quick Setup

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment Variable

Replace `YOUR_GEMINI_API_KEY_HERE` in your `.env` file with your actual API key:

```bash
VITE_GEMINI_API_KEY="your_actual_api_key_here"
```

### Step 3: Restart Development Server

After updating the `.env` file, restart your development server:

```bash
npm run dev
```

## Features

### ✨ **Enhanced AI Responses**

- Subject-specific prompting for better contextual responses
- Chat history for contextual conversations
- Step-by-step explanations for educational content
- Markdown formatting for better readability

### 🎤 **Voice Input**

- Browser-based speech recognition
- Real-time voice-to-text conversion
- Supports multiple languages
- Works in Chrome, Edge, and Safari

### 📸 **Image Analysis**

- Upload and analyze images with Gemini Vision
- Text extraction from images (OCR)
- Diagram and chart interpretation
- Educational content analysis
- Supports JPEG, PNG, WebP formats (max 10MB)

- Subject-specific prompting for better contextual responses
- Chat history for contextual conversations
- Step-by-step explanations for educational content
- Markdown formatting for better readability

### 🔧 **Flexible Configuration**

- Environment variable configuration (recommended)
- Runtime API key configuration via settings dialog
- Automatic initialization and validation
- Graceful error handling

### 📚 **Subject Specialization**

The AI is optimized for different subjects:

- **Mathematics**: Step-by-step solutions, formulas
- **Science**: Clear explanations, real-world examples
- **Programming**: Code examples, best practices
- **History**: Contextual timelines, cause-and-effect
- **Language**: Grammar, vocabulary, usage examples
- **General**: Comprehensive assistance

## Security Notes

⚠️ **Important Security Considerations:**

- Never commit API keys to version control
- Keep your `.env` file in `.gitignore`
- Consider using different keys for development and production
- Monitor your API usage in Google Cloud Console

## Troubleshooting

### Common Issues:

1. **"Gemini AI not initialized"**

   - Check your API key in the `.env` file
   - Restart the development server
   - Verify the API key is valid

2. **"Failed to generate response"**

   - Check your internet connection
   - Verify API key permissions
   - Check API quota limits

3. **Settings dialog shows "API Key Required"**
   - Your environment variable might not be set correctly
   - Use the settings dialog to configure the key at runtime

## Environment Variables

```bash
# Required for Gemini AI
VITE_GEMINI_API_KEY="your_gemini_api_key"

# Existing Supabase configuration
VITE_SUPABASE_PROJECT_ID="hkicxvmugfqimqnabmmx"
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_URL="https://hkicxvmugfqimqnabmmx.supabase.co"
```
