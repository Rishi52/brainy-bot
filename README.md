# BrainyBot - AI Study Companion

<div align="center">

![BrainyBot Logo](https://img.shields.io/badge/BrainyBot-AI%20Study%20Companion-6366f1?style=for-the-badge&logo=brain&logoColor=white)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

**An intelligent, AI-powered study companion that helps students learn through text, voice, and image inputs.**

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## 🌟 Features

### 💬 **Multi-Modal Input**
- **Text Chat**: Traditional text-based conversations with AI
- **Voice Input**: Browser-based speech recognition for hands-free interaction
- **Image Analysis**: Upload images for OCR, diagram interpretation, and visual problem-solving

### 🎯 **Subject Specialization**
BrainyBot adapts its responses based on the selected subject:
- 🔢 **Mathematics**: Step-by-step solutions with LaTeX formatting
- 🧪 **Science**: Clear explanations with real-world examples
- 💻 **Programming**: Code examples with best practices
- 📚 **History**: Contextual timelines and cause-effect relationships
- 🌍 **Language**: Grammar, vocabulary, and usage guidance
- 🎯 **General**: Comprehensive academic assistance

### 🧠 **Intelligent Features**
- **Context-Aware Responses**: Maintains conversation history for coherent interactions
- **Personalized Learning**: Adapts explanations based on user's age and education level
- **Real-Time Streaming**: Get responses as they're generated
- **Markdown Support**: Properly formatted responses with code blocks and LaTeX math
- **Dark/Light Mode**: Beautiful UI that adapts to your preference

### 📱 **User Experience**
- **Conversation Management**: Save, load, and organize multiple chat sessions
- **Mobile Responsive**: Fully optimized for mobile, tablet, and desktop
- **Voice Output**: Text-to-speech for audio playback of responses
- **Copy & Share**: Easy copy functionality for saving responses

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** (for backend services)
- **Google Gemini API Key** (for AI capabilities)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/brainybot.git
cd brainybot
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
VITE_SUPABASE_URL="https://your_project.supabase.co"

# Gemini AI Configuration
VITE_GEMINI_API_KEY="your_gemini_api_key"
```

#### Getting Your API Keys:

**Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and paste into your `.env` file

**Supabase Setup:**
1. Create a project at [Supabase](https://supabase.com/)
2. Get your project credentials from Settings → API
3. Run the migrations from `supabase/migrations/` to set up the database schema

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Step 5: Build for Production

```bash
npm run build
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 7.2** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling
- **shadcn/ui** - Component library
- **React Router 6** - Navigation
- **TanStack Query** - Data fetching

### Backend & Services
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Edge Functions
  - Row Level Security
- **Google Gemini AI 2.5 Flash** - AI model for responses and image analysis
- **Web Speech API** - Browser-based voice recognition

### Key Libraries
- `@google/generative-ai` - Gemini AI SDK
- `@supabase/supabase-js` - Supabase client
- `react-markdown` - Markdown rendering
- `katex` - LaTeX math rendering
- `lucide-react` - Icon library
- `sonner` - Toast notifications

---

## 📖 Usage

### Creating an Account

1. Navigate to the authentication page
2. Choose "Sign Up" tab
3. Enter your name, email, and password
4. Complete the profile setup with your age and education level
5. Start chatting!

### Using Different Input Methods

**Text Input:**
- Simply type your question and press Enter or click Send

**Voice Input:**
- Click the microphone icon 🎤
- Allow microphone permissions when prompted
- Speak clearly and wait for transcription
- Review the transcribed text before sending

**Image Input:**
- Click the image icon 📸
- Select an image from your device (JPEG, PNG, WebP - max 10MB)
- Add an optional text prompt
- Send for AI analysis

### Subject Selection

Choose the appropriate subject from the dropdown to get specialized responses:
- Math problems get step-by-step solutions
- Code questions include working examples
- Science topics use real-world analogies
- And more!

### Managing Conversations

- **New Chat**: Click "New Chat" to start fresh
- **View History**: All conversations are saved in the sidebar
- **Search**: Find past conversations using the search bar
- **Delete**: Remove conversations you no longer need

---

## 🏗️ Project Structure

```
brainybot/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessages.tsx
│   │   │   └── ChatSidebar.tsx
│   │   └── ui/
│   │       └── [shadcn components]
│   ├── hooks/
│   │   ├── use-theme.tsx
│   │   ├── use-toast.ts
│   │   └── useUserProfile.ts
│   ├── integrations/
│   │   └── supabase/
│   ├── lib/
│   │   ├── gemini.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── Chat.tsx
│   │   └── NotFound.tsx
│   └── App.tsx
├── supabase/
│   ├── functions/
│   │   ├── chat-ai/
│   │   └── user-profile/
│   └── migrations/
├── public/
└── [config files]
```

---

## 🔐 Security & Privacy

- **Authentication**: Secure user authentication via Supabase Auth
- **Row Level Security**: Database queries are automatically filtered by user
- **API Key Protection**: Environment variables keep sensitive keys secure
- **No Data Sharing**: User conversations are private and not shared
- **HTTPS**: All communications are encrypted in production

---

## 🚀 Deployment

### Deploy to Vercel/Netlify

1. Connect your GitHub repository
2. Set environment variables in the hosting platform
3. Deploy!

### Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your_project_ref

# Deploy functions
supabase functions deploy chat-ai
supabase functions deploy user-profile
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 🙏 Acknowledgments

- **Google Gemini AI** for the powerful language model
- **Supabase** for the excellent backend infrastructure
- **shadcn/ui** for the beautiful component library
- **Lovable** for the initial project setup
- All open-source contributors who made this possible

---

<div align="center">

**Made with ❤️ for students everywhere**

⭐ Star us on GitHub — it helps!

[Report Bug](https://github.com/yourusername/brainybot/issues) • [Request Feature](https://github.com/yourusername/brainybot/issues)

</div>
