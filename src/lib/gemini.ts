import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private visionModel: GenerativeModel | null = null;

  constructor() {
    this.initializeGemini();
  }

  private initializeGemini() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('Gemini API key not found or not configured in environment variables');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-1.5-flash which supports both text and images
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });
      this.visionModel = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });
      console.log('Gemini AI initialized successfully');
    } catch (error) {
      console.error('Error initializing Gemini:', error);
    }
  }

  async generateResponse(prompt: string, subject: string = 'general'): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    try {
      // Enhanced prompt based on subject
      const systemPrompt = this.getSystemPrompt(subject);
      const enhancedPrompt = `${systemPrompt}\n\nUser Question: ${prompt}`;

      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  async generateResponseWithHistory(
    prompt: string, 
    history: Array<{role: string; content: string}>, 
    subject: string = 'general'
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    try {
      const chat = this.model.startChat({
        history: this.formatHistoryForGemini(history),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const systemPrompt = this.getSystemPrompt(subject);
      const enhancedPrompt = `${systemPrompt}\n\n${prompt}`;

      const result = await chat.sendMessage(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('Error generating response with history:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  private formatHistoryForGemini(history: Array<{role: string; content: string}>) {
    return history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  private getSystemPrompt(subject: string): string {
    const basePrompt = `You are BrainyBot, an AI study companion designed to help students learn effectively. You should:
- Provide clear, step-by-step explanations
- Use examples to illustrate concepts
- Encourage learning and critical thinking
- Be patient and supportive
- Format responses with proper markdown for readability`;

    const subjectPrompts = {
      math: `${basePrompt}
- Focus on mathematical concepts, formulas, and problem-solving techniques
- Show step-by-step solutions
- Use mathematical notation when appropriate`,
      
      science: `${basePrompt}
- Explain scientific concepts clearly
- Use real-world examples and analogies
- Include relevant formulas and principles
- Encourage scientific thinking and inquiry`,
      
      coding: `${basePrompt}
- Provide code examples with explanations
- Focus on best practices and clean code
- Explain concepts from beginner to advanced levels
- Include debugging tips and common pitfalls`,
      
      history: `${basePrompt}
- Present historical events in context
- Explain cause and effect relationships
- Use timelines and key dates
- Connect historical events to modern times`,
      
      language: `${basePrompt}
- Focus on grammar, vocabulary, and language structure
- Provide examples in context
- Explain language rules clearly
- Help with pronunciation and usage`,
      
      general: basePrompt
    };

    return subjectPrompts[subject as keyof typeof subjectPrompts] || basePrompt;
  }

  async generateResponseFromImage(imageBase64: string, prompt: string, subject: string = 'general'): Promise<string> {
    if (!this.visionModel) {
      throw new Error('Gemini Vision model not initialized. Please check your API key.');
    }

    try {
      // Remove data URL prefix if present and detect MIME type
      let mimeType = 'image/jpeg'; // default
      let base64Data = imageBase64;
      
      if (imageBase64.startsWith('data:')) {
        const mimeMatch = imageBase64.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        base64Data = imageBase64.split(',')[1];
      }
      
      const systemPrompt = this.getSystemPrompt(subject);
      const enhancedPrompt = `${systemPrompt}\n\nAnalyze this image and ${prompt}`;

      const result = await this.visionModel.generateContent([
        enhancedPrompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('Error analyzing image with Gemini:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  // Speech-to-text using Web Speech API (browser native)
  startSpeechRecognition(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if browser supports Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let hasResult = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        if (results && results[0] && results[0][0]) {
          const transcript = results[0][0].transcript.trim();
          if (transcript) {
            hasResult = true;
            resolve(transcript);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const error = event.error;
        if (error === 'aborted' || error === 'no-speech') {
          if (!hasResult) {
            reject(new Error('No speech detected. Please try again and speak clearly.'));
          }
        } else {
          reject(new Error(`Speech recognition failed: ${error}. Please check microphone permissions.`));
        }
      };

      recognition.onend = () => {
        if (!hasResult) {
          reject(new Error('Speech recognition ended without capturing any speech.'));
        }
      };

      recognition.onnomatch = () => {
        reject(new Error('No recognizable speech detected. Please try again.'));
      };

      try {
        recognition.start();
        
        // Set a timeout to prevent hanging
        setTimeout(() => {
          if (!hasResult) {
            recognition.stop();
            reject(new Error('Speech recognition timeout. Please try again.'));
          }
        }, 10000); // 10 second timeout
        
      } catch (error) {
        reject(new Error('Failed to start speech recognition. Please check microphone permissions.'));
      }
    });
  }

  // Alternative: Send audio to Gemini for transcription (if supported in future)
  async transcribeAudioWithGemini(audioBase64: string): Promise<string> {
    // Note: As of now, Gemini doesn't directly support audio input
    // This method is prepared for future audio support
    throw new Error('Audio transcription with Gemini not yet supported. Using browser Speech API instead.');
  }

  isInitialized(): boolean {
    return this.model !== null;
  }

  isVisionEnabled(): boolean {
    return this.visionModel !== null;
  }
}

export const geminiService = new GeminiService();