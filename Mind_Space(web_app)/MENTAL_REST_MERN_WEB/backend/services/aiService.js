const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.timeout = 30000; // 30 seconds timeout

    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY is not set. AI features will not work.');
    }

    // Initialize with the latest method
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    
    // Test the API key on initialization (async)
    if (this.genAI) {
      this.testAPIKey().catch(err => {
        console.error('Failed to test API key:', err.message);
      });
    }
  }

  // Test API key and find working model
  async testAPIKey() {
    // Skip API key testing if using placeholder key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      console.log('⚠️  Gemini API key not configured. AI insights will use fallback responses.');
      this.modelName = 'gemini-1.5-pro'; // Set default model
      return true; // Return true to allow server to continue
    }
    
    console.log('Testing API key with models...');
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-pro-latest'];
    
    for (const model of modelsToTry) {
      try {
        console.log(`Testing model: ${model}`);
        const testModel = this.genAI.getGenerativeModel({ model });
        const response = await testModel.generateContent('Test');
        
        if (response.response && response.response.text) {
          console.log(`✅ Working model found: ${model}`);
          this.modelName = model;
          return true;
        } else if (response.text) {
          console.log(`✅ Working model found: ${model}`);
          this.modelName = model;
          return true;
        } else {
          console.log(`❌ Model ${model} response format unexpected:`, Object.keys(response));
        }
      } catch (error) {
        console.log(`❌ Model ${model} not available: ${error.message}`);
      }
    }
    
    console.error('❌ No working Gemini models found. Please check your API key.');
    return false;
  }

  // Check Gemini health by issuing a tiny JSON response request
  async checkServerHealth() {
    try {
      if (!this.genAI) throw new Error('Gemini client not initialized');
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { maxOutputTokens: 8 }
      });
      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Respond with {"ok":true} only.' }] }],
        generationConfig: { responseMimeType: 'application/json' }
      });
      const text = (res.response && typeof res.response.text === 'function') ? res.response.text() : '';
      let ok = false;
      try { ok = JSON.parse(text).ok === true; } catch (_) { ok = false; }
      return { isRunning: ok, model: this.modelName };
    } catch (error) {
      return { isRunning: false, error: error.message };
    }
  }

  // Analyze sentiment of journal entry
  async analyzeSentiment(text) {
    try {
      const prompt = `Analyze the emotional sentiment of the following journal entry. Respond with a JSON object containing:
      - sentiment: "positive", "negative", or "neutral"
      - confidence: a number between 0 and 1
      - keywords: an array of 3-5 key emotional words
      - summary: a brief 1-2 sentence summary
      - suggestions: an array of 2-3 helpful suggestions for mental wellness

      Journal entry: "${text}"

      Respond only with valid JSON:`;

      const response = await this.generateResponse(prompt);
      
      // Try to parse JSON response
      try {
        const analysis = JSON.parse(response);
        return {
          sentiment: analysis.sentiment || 'neutral',
          confidence: Math.min(Math.max(analysis.confidence || 0.5, 0), 1),
          keywords: analysis.keywords || [],
          summary: analysis.summary || 'No summary available',
          suggestions: analysis.suggestions || []
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return this.parseFallbackSentiment(response);
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error.message);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        summary: 'Unable to analyze sentiment at this time',
        suggestions: ['Consider taking a moment to reflect on your feelings', 'Try some deep breathing exercises']
      };
    }
  }

  // Generate wellness tips based on mood patterns
  async generateWellnessTips(moodData, userPreferences = {}, category = 'general') {
    try {
      const { prompt, categoryContext } = this.buildWellnessTipsPrompt(moodData, userPreferences, category);

      const response = await this.generateResponse(prompt);
      
      try {
        const tips = JSON.parse(response);
        return {
          tips: tips.tips || this.getDefaultTipsForCategory(category),
          focus: tips.focus || categoryContext,
          encouragement: tips.encouragement || this.getDefaultEncouragementForCategory(category)
        };
      } catch (parseError) {
        return this.parseFallbackTips(response, category);
      }
    } catch (error) {
      console.error('Wellness tips generation error:', error.message);
      return {
        tips: this.getDefaultTipsForCategory(category),
        focus: this.getDefaultFocusForCategory(category),
        encouragement: this.getDefaultEncouragementForCategory(category)
      };
    }
  }

  buildWellnessTipsPrompt(moodData, userPreferences = {}, category = 'general') {
    const categoryPrompts = {
      general: 'general wellness and self-care',
      stress: 'stress management and relaxation techniques',
      motivation: 'motivation, goal-setting, and personal growth',
      mindfulness: 'mindfulness, meditation, and present-moment awareness',
      social: 'social connection, relationships, and community building',
      physical: 'physical health, exercise, and body wellness',
      sleep: 'sleep hygiene, rest, and recovery',
      gratitude: 'gratitude practice and positive thinking'
    };

    const categoryContext = categoryPrompts[category] || categoryPrompts.general;

      const prompt = `You are a helpful mental wellness assistant.
      Based on the following mood data and user preferences, generate personalized wellness tips focused on ${categoryContext}. Respond with a JSON object containing:
    - tips: an array of 5 specific, actionable wellness tips tailored to ${categoryContext}
    - focus: the main area to focus on (e.g., "${categoryContext}")
    - encouragement: a motivational message specific to ${categoryContext}

    Mood data: ${JSON.stringify(moodData)}
    User preferences: ${JSON.stringify(userPreferences)}
    Requested category: ${category}
    Request ID: ${userPreferences.requestId || Date.now()}
    User ID: ${userPreferences.userId || 'anonymous'}
    Timestamp: ${userPreferences.timestamp || Date.now()}
    Seed: ${userPreferences.seed || Math.random()}

    IMPORTANT: Make the tips specific, actionable, and varied. Avoid repeating the same suggestions.
    Use the timestamp and seed to ensure variety. Focus on ${categoryContext}.
    Each request should generate different tips even for the same category.

    Respond only with valid JSON:`;

    return { prompt, categoryContext };
  }

  async generateResponseStream(prompt, onDelta) {
    try {
      if (!this.genAI) throw new Error('Gemini client not initialized');
      console.log('Generating response stream with model:', this.modelName);
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1000
          }
        });
      const res = await model.generateContent(prompt);
      console.log('Raw response structure:', JSON.stringify(res, null, 2).substring(0, 500));
        let fullText = '';
        try {
          // Try multiple extraction methods
          if (res.response && typeof res.response.text === 'function') {
            fullText = res.response.text();
          } else if (res.response && res.response.text) {
            fullText = res.response.text;
          } else if (res.text) {
            fullText = res.text;
          } else if (res.response && Array.isArray(res.response.candidates)) {
            const part = res.response.candidates[0]?.content?.parts?.[0];
            fullText = (part && (part.text || part)) || '';
          } else if (res.candidates && Array.isArray(res.candidates)) {
            const part = res.candidates[0]?.content?.parts?.[0];
            fullText = (part && (part.text || part)) || '';
          } else if (res.content && res.content.parts) {
            const part = res.content.parts[0];
            fullText = (part && (part.text || part)) || '';
          }
          
          // If still empty, try to extract from the raw response
          if (!fullText && res.response) {
            const responseStr = JSON.stringify(res.response);
            if (responseStr.includes('text')) {
              const textMatch = responseStr.match(/"text":"([^"]+)"/);
              if (textMatch) {
                fullText = textMatch[1];
              }
            }
          }
          
          console.log('Extracted text length:', fullText.length);
          console.log('Extracted text preview:', fullText.substring(0, 100));
        } catch (err) {
          console.error('Error extracting text:', err.message);
        }

      if (fullText && fullText.trim()) {
        const step = 60; // simulate streaming in small chunks
        for (let i = 0; i < fullText.length; i += step) {
          const delta = fullText.slice(i, i + step);
          onDelta(delta);
        }
      } else {
        console.log('No valid text extracted, using fallback');
        // If no text extracted, use intelligent fallback
        const fallbackResponse = this.generateIntelligentFallback(prompt);
        const step = 20;
        for (let i = 0; i < fallbackResponse.length; i += step) {
          const delta = fallbackResponse.slice(i, i + step);
          onDelta(delta);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Gemini generateResponseStream error:', error.message);
      console.error('Full error:', error);
      // Intelligent fallback response based on prompt
      const fallbackResponse = this.generateIntelligentFallback(prompt);
      console.log('Using fallback response:', fallbackResponse);
      const step = 20;
      for (let i = 0; i < fallbackResponse.length; i += step) {
        const delta = fallbackResponse.slice(i, i + step);
        onDelta(delta);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // Generate intelligent fallback responses
  generateIntelligentFallback(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Mental health support responses
    if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxious') || lowerPrompt.includes('anxiety')) {
      return "I understand that you're feeling stressed or anxious 😔. Here are some things that might help: Take slow, deep breaths - inhale for 4 counts, hold for 4, exhale for 4 🫁. Try to ground yourself by naming 5 things you can see around you 👀. Remember, these feelings are temporary and you have the strength to get through this 💪. Would you like to talk more about what's causing these feelings? 💭";
    }
    
    if (lowerPrompt.includes('sad') || lowerPrompt.includes('depress') || lowerPrompt.includes('down')) {
      return "I'm here to listen and support you 🤗. It's okay to feel sad sometimes - these emotions are valid 💙. Some things that might help: Take a short walk outside 🌳, reach out to someone you trust 👥, write down your feelings in a journal 📝, or engage in an activity you usually enjoy 🎨. Remember, it's important to be kind to yourself 💕. If these feelings persist, please consider talking to a mental health professional 🩺. How can I best support you right now? 💭";
    }
    
    if (lowerPrompt.includes('sleep') || lowerPrompt.includes('insomnia') || lowerPrompt.includes('tired')) {
      return "Sleep is so important for our mental and physical health 😴💤. Here are some tips for better sleep: Keep a consistent sleep schedule ⏰, avoid screens 1 hour before bed 📱, create a relaxing bedtime routine 🛁, keep your bedroom cool and dark 🌙, and try some relaxation techniques like deep breathing or progressive muscle relaxation 🧘‍♀️. Would you like more specific sleep hygiene tips? 💭";
    }
    
    if (lowerPrompt.includes('lonely') || lowerPrompt.includes('alone') || lowerPrompt.includes('isolated')) {
      return "Feeling lonely can be really difficult, but you're not alone in feeling this way 🤗. Here are some suggestions: Reach out to an old friend or family member 👥, join a club or group that interests you 🎯, volunteer for a cause you care about ❤️, or try online communities for your hobbies 🌐. Even small social interactions can help 💫. Remember, it's okay to reach out for connection - it's a sign of strength, not weakness 💪. What activities do you enjoy that might help you connect with others? 🎨";
    }
    
    if (lowerPrompt.includes('thank') || lowerPrompt.includes('help')) {
      return "You're very welcome! 😊 I'm glad I could help 💙. Remember, taking care of your mental health is an ongoing journey 🌱, and it's wonderful that you're being proactive about it ✨. Feel free to reach out anytime you need support or just want to talk 💭. You're doing great by seeking help and taking these steps 🎯. Is there anything else I can assist you with today? 🤗";
    }
    
    if (lowerPrompt.includes('hi') || lowerPrompt.includes('hello') || lowerPrompt.includes('hey')) {
      return "Hello! 😊 I'm here to support you on your mental wellness journey 🌟. I'm a supportive companion designed to listen and provide helpful tips for managing stress, improving mood, and maintaining emotional balance 💙. How are you feeling today? 💭 Is there anything specific on your mind that you'd like to talk about? 🤗";
    }
    
    // Default supportive response
    return "I'm here to support you with your mental wellness 💙. Whether you're dealing with stress, anxiety, low mood, sleep issues, or just want someone to talk to, I'm here to listen 🤗. Remember, taking care of your mental health is just as important as physical health 💪. What's on your mind today? 💭 How can I best support you? 🌟";
  }

  buildChatPrompt(userMessage, context = {}, history = []) {
    const systemPreamble = `You are MindSpace's supportive wellness assistant. Be concise, kind, and non-clinical. Avoid medical advice. Offer practical tips and resources. Use emojis to make your responses more friendly and engaging. Include relevant emojis like 😊, 💙, 🌟, 🧘‍♀️, 💪, 🌱, 🎯, 💭, 🌈, 🤗, etc. to make the conversation warm and supportive.`;
    const contextBlock = `Context: ${JSON.stringify(context)}`;
    const historyBlock = history.slice(-6).map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n');
    const prompt = `${systemPreamble}\n${contextBlock}\n${historyBlock ? historyBlock + '\n' : ''}USER: ${userMessage}\nASSISTANT:`;
    return prompt;
  }

  // Generate guided journal prompts
  async generateJournalPrompts(category = 'general', userMood = 'neutral') {
    try {
      const prompt = `Generate 3 creative journal prompts for ${category} category, considering the user's current mood: ${userMood}. 
      Respond with a JSON object containing:
      - prompts: an array of 3 prompt objects, each with "title" and "content"
      - difficulty: "beginner", "intermediate", or "advanced"
      - estimatedTime: time in minutes

      Respond only with valid JSON. Do not include markdown or extra text. If uncertain, still return a valid JSON with best effort values.`;

      const response = await this.generateResponse(prompt);
      
      try {
        const prompts = JSON.parse(response);
        return {
          prompts: prompts.prompts || this.getDefaultPrompts(category),
          difficulty: prompts.difficulty || 'beginner',
          estimatedTime: prompts.estimatedTime || 5
        };
      } catch (parseError) {
        return {
          prompts: this.getDefaultPrompts(category),
          difficulty: 'beginner',
          estimatedTime: 5
        };
      }
    } catch (error) {
      console.error('Prompt generation error:', error.message);
      return {
        prompts: this.getDefaultPrompts(category),
        difficulty: 'beginner',
        estimatedTime: 5
      };
    }
  }

  buildDashboardSummaryPrompt(moodStats, recentInsights = []) {
    // Simplify mood stats to reduce token usage
    const simpleMoodStats = moodStats.map(m => ({ mood: m._id, count: m.count })).slice(0, 3);
    
    // Add timestamp to ensure variety in responses
    const timestamp = new Date().toISOString();
    
    const prompt = `Generate a fresh, unique dashboard summary in JSON.

Data: ${JSON.stringify(simpleMoodStats)}, insights: ${recentInsights.length}
Timestamp: ${timestamp}

JSON format:
{"summary": "Encouraging sentence with emojis (max 60 chars)", "highlight": "Tip with emojis (max 50 chars)"}

Guidelines:
- Use emojis: 🌟, 💙, 💪, 🌱, 🎯
- Be encouraging and concise
- Create a unique, fresh response each time
- Vary your language and suggestions
- Respond ONLY with valid JSON

Example: {"summary": "Your mood trends look positive! 🌟", "highlight": "💡 Keep up the great work! ✨"}`;
    console.log('Building dashboard summary prompt with data:', { moodStats: simpleMoodStats, recentInsights: recentInsights.length, timestamp });
    return prompt;
  }

  buildInsightsSummaryPrompt(moodStats, recentInsights = [], recentEntries = []) {
    const entryCount = recentEntries.length;
    const hasEntries = entryCount > 0;
    
    // Simplify mood stats to reduce token usage
    const simpleMoodStats = moodStats.map(m => ({ mood: m._id, count: m.count })).slice(0, 3);
    
    // Add timestamp to ensure variety in responses
    const timestamp = new Date().toISOString();
    
    const prompt = `Generate a fresh, unique wellness summary in JSON.

Data: ${JSON.stringify(simpleMoodStats)}, entries: ${entryCount}
Timestamp: ${timestamp}

JSON format:
{"summary": "Encouraging sentence with emojis (max 60 chars)", "highlight": "Tip with emojis (max 50 chars)"}

Guidelines:
- Use emojis: 🌟, 💙, 💪, 🌱, 🎯
- Be encouraging and personal
- Create a unique, fresh response each time
- Vary your language and suggestions
- Respond ONLY with valid JSON

Example: ${hasEntries ? 
  '{"summary": "Your mood has been positive! 🌟", "highlight": "💡 Try gratitude journaling! ✨"}' :
  '{"summary": "Welcome to your journey! 🌟", "highlight": "💡 Start journaling today! ✨"}'}`;
    console.log('Building insights summary prompt with data:', { moodStats: simpleMoodStats, recentInsights: recentInsights.length, recentEntries: recentEntries.length });
    return prompt;
  }

  buildEncouragementPrompt(categoryContext = 'general wellness and self-care', requestMeta = {}) {
    const { timestamp = Date.now(), seed = Math.random(), userId = 'anonymous' } = requestMeta;
    const prompt = `Generate a short, uplifting encouragement line in JSON with:
    - encouragement: a single sentence under 160 characters
    Tailor it for ${categoryContext}. Use these to vary output and avoid repetition between calls:
    timestamp: ${timestamp}
    seed: ${seed}
    userId: ${userId}
    Respond only with valid JSON and no extra text.`;
    return prompt;
  }

  // Core method to generate JSON responses using Gemini
  async generateResponse(prompt) {
    try {
      if (!this.genAI) throw new Error('Gemini client not initialized');
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1000
          }
        });
      const res = await model.generateContent(prompt);
      // Prefer candidates parts text if available
      let text = '';
      try {
        if (res.text) {
          text = res.text;
        } else if (res.response && typeof res.response.text === 'function') {
          text = res.response.text();
        } else if (res.response && Array.isArray(res.response.candidates)) {
          const part = res.response.candidates[0]?.content?.parts?.[0];
          text = (part && (part.text || part)) || '';
        }
      } catch {}
      return text || '';
    } catch (error) {
      console.error('Gemini generateResponse error:', error.message);
      throw error;
    }
  }

  // Fallback sentiment parsing when JSON parsing fails
  parseFallbackSentiment(response) {
    const sentiment = response.toLowerCase().includes('positive') ? 'positive' :
                     response.toLowerCase().includes('negative') ? 'negative' : 'neutral';
    
    return {
      sentiment,
      confidence: 0.6,
      keywords: ['emotional', 'reflection'],
      summary: response.substring(0, 100) + '...',
      suggestions: ['Consider your emotional state', 'Take time for self-reflection']
    };
  }

  // Fallback tips parsing when JSON parsing fails
  parseFallbackTips(response, category = 'general') {
    return {
      tips: this.getDefaultTipsForCategory(category),
      focus: this.getDefaultFocusForCategory(category),
      encouragement: this.getDefaultEncouragementForCategory(category)
    };
  }

  // Get default tips for specific category
  getDefaultTipsForCategory(category) {
    const categoryTips = {
      general: [
        'Take a 5-minute break to breathe deeply and center yourself',
        'Write down three things you\'re grateful for today',
        'Go for a short walk outside and notice your surroundings',
        'Listen to calming music or nature sounds',
        'Practice mindfulness meditation for 10 minutes'
      ],
      stress: [
        'Try the 4-7-8 breathing technique: inhale 4, hold 7, exhale 8',
        'Progressive muscle relaxation - tense and release each muscle group',
        'Take a warm bath or shower to relax your body',
        'Write down your worries and then let them go',
        'Practice grounding techniques: name 5 things you can see, hear, touch'
      ],
      motivation: [
        'Set one small, achievable goal for today',
        'Create a vision board or write down your dreams',
        'Celebrate your recent accomplishments, no matter how small',
        'Surround yourself with positive, inspiring content',
        'Break down big tasks into smaller, manageable steps'
      ],
      mindfulness: [
        'Practice mindful eating - savor each bite without distractions',
        'Do a body scan meditation to check in with yourself',
        'Practice mindful walking - focus on each step and breath',
        'Try the RAIN technique: Recognize, Allow, Investigate, Nurture',
        'Spend 5 minutes observing your thoughts without judgment'
      ],
      social: [
        'Reach out to a friend or family member you haven\'t talked to recently',
        'Join a community group or club that interests you',
        'Practice active listening in your conversations today',
        'Share something positive or funny with someone you care about',
        'Volunteer for a cause that matters to you'
      ],
      physical: [
        'Take a 10-minute walk or do some gentle stretching',
        'Drink a glass of water and stay hydrated throughout the day',
        'Try some light yoga or tai chi movements',
        'Get some fresh air and natural sunlight',
        'Practice good posture and take breaks from sitting'
      ],
      sleep: [
        'Create a relaxing bedtime routine and stick to it',
        'Avoid screens 1 hour before bedtime',
        'Keep your bedroom cool, dark, and quiet',
        'Try relaxation techniques like deep breathing before sleep',
        'Write down any worries in a journal to clear your mind'
      ],
      gratitude: [
        'Write down three specific things you\'re grateful for today',
        'Send a thank you message to someone who made a difference',
        'Notice and appreciate the small moments of joy',
        'Keep a gratitude jar and add one thing daily',
        'Practice gratitude meditation or reflection'
      ]
    };
    
    return categoryTips[category] || categoryTips.general;
  }

  // Get default focus for specific category
  getDefaultFocusForCategory(category) {
    const focusMap = {
      general: 'general wellness and self-care',
      stress: 'stress management and relaxation',
      motivation: 'motivation and goal-setting',
      mindfulness: 'mindfulness and present-moment awareness',
      social: 'social connection and community',
      physical: 'physical wellness and movement',
      sleep: 'sleep hygiene and rest',
      gratitude: 'gratitude and appreciation'
    };
    
    return focusMap[category] || focusMap.general;
  }

  // Get default encouragement for specific category
  getDefaultEncouragementForCategory(category) {
    const encouragementMap = {
      general: 'Remember to be kind to yourself. Small steps lead to big changes.',
      stress: 'You\'re stronger than your stress. Take it one breath at a time.',
      motivation: 'You have the power to create positive change. Start with one small step!',
      mindfulness: 'The present moment is where life happens. Embrace it with curiosity.',
      social: 'Connection is the foundation of well-being. Reach out and let others in.',
      physical: 'Your body is your home. Treat it with love and care.',
      sleep: 'Quality sleep is essential for your well-being. Prioritize your rest.',
      gratitude: 'Gratitude transforms what we have into enough. Count your blessings.'
    };
    
    return encouragementMap[category] || encouragementMap.general;
  }

  // Default prompts when AI generation fails
  getDefaultPrompts(category) {
    const defaultPrompts = {
      gratitude: [
        { title: 'Three Good Things', content: 'Write about three good things that happened today, no matter how small.' },
        { title: 'Grateful Person', content: 'Think of someone you\'re grateful for and write about why they mean so much to you.' },
        { title: 'Simple Pleasures', content: 'What simple pleasures brought you joy today?' }
      ],
      reflection: [
        { title: 'Today\'s Learning', content: 'What did you learn about yourself today?' },
        { title: 'Growth Moment', content: 'Describe a moment today when you felt you grew or improved.' },
        { title: 'Challenges Overcome', content: 'What challenge did you face today and how did you handle it?' }
      ],
      mindfulness: [
        { title: 'Present Moment', content: 'Describe what you\'re experiencing right now using all your senses.' },
        { title: 'Breath Awareness', content: 'Write about your breathing and how it feels in this moment.' },
        { title: 'Body Scan', content: 'Notice how your body feels right now and write about any sensations.' }
      ],
      general: [
        { title: 'Free Write', content: 'Write whatever comes to mind. Don\'t worry about structure or grammar.' },
        { title: 'Emotional Check-in', content: 'How are you feeling right now? What emotions are present?' },
        { title: 'Day Summary', content: 'Summarize your day in a few sentences. What stood out?' }
      ]
    };

    return defaultPrompts[category] || defaultPrompts.general;
  }

  // Batch analyze multiple entries
  async batchAnalyzeSentiment(entries) {
    try {
      const results = [];
      
      for (const entry of entries) {
        const analysis = await this.analyzeSentiment(entry.content);
        results.push({
          entryId: entry._id,
          analysis
        });
      }
      
      return results;
    } catch (error) {
      console.error('Batch sentiment analysis error:', error.message);
      return [];
    }
  }
}

module.exports = new AIService();
