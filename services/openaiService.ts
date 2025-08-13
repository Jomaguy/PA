import OpenAI from 'openai';
import Constants from 'expo-constants';
import { formatNewsForOpenAI, NewsArticle } from './rssNewsService';

// Load environment variables with proper Expo support
const OPENAI_API_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY || 
                       process.env.OPENAI_API_KEY || 
                       'demo_key';

// Debug: Log the API key source (first 8 characters only for security)
console.log('🔑 OpenAI API Key source:', OPENAI_API_KEY === 'demo_key' ? 'FALLBACK (demo_key)' : `LOADED (${OPENAI_API_KEY.substring(0, 8)}...)`);

// Initialize OpenAI client with browser support for React Native Web
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for React Native Web environment
});

/**
 * Focused Strategic Brief System Prompt - technology, markets, and international politics
 */
const STRATEGIC_BRIEF_SYSTEM_PROMPT = `You are an expert personal AI assistant specialized in delivering focused strategic briefings covering three key areas: Technology, Markets & Finance, and International Politics.

You will receive real, current news articles from trusted sources like Reuters, BBC, TechCrunch, and MarketWatch, specifically filtered for these three topics.

IMPORTANT GUIDELINES:
- Focus exclusively on Technology, Markets/Finance, and International Politics
- Create a cohesive briefing that connects stories across these three domains
- Speak in a professional yet conversational tone
- Keep the entire briefing under 3 minutes when spoken aloud
- Highlight how these three areas interconnect and influence each other
- Provide strategic insights and analysis, not just summaries
- End with actionable insights or forward-looking perspective

CONVERSATION FLOW:
1. ALWAYS start by stating the current time and date clearly
2. Brief greeting acknowledging this is a focused strategic briefing
3. Overview of key themes across the three focus areas
4. Highlight the most significant developments in each area:
   - Technology: Innovation, AI, startups, digital transformation
   - Markets: Economic indicators, major market moves, financial trends
   - International Politics: Global developments affecting business and technology
5. Strategic connections between the three areas
6. Forward-looking insights and implications

TONE AND STYLE:
- Professional and strategic (business-focused audience)
- Insightful and analytical
- Connect dots between technology, markets, and geopolitics
- Use "you" to make it personal and actionable
- Include transitional phrases for smooth speech flow

STRATEGIC FOCUS:
- How do political developments affect markets and technology?
- What technology trends are driving market movements?
- How do market conditions influence technology innovation and global politics?
- What are the strategic implications for business and decision-making?

Remember: This is a strategic briefing for someone who needs to understand the intersection of technology, markets, and global politics for informed decision-making. ALWAYS begin by stating the current time and date.`;

/**
 * Generate focused strategic brief using real RSS news articles
 */
export const generateStrategicBriefText = async (newsArticles: NewsArticle[]): Promise<string> => {
  console.log('🤖 Generating focused strategic brief (Tech/Markets/Politics)...');
  
  // Check if we have a valid API key
  if (OPENAI_API_KEY === 'demo_key') {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.');
  }
  
  // Check if we have news articles
  if (!newsArticles || newsArticles.length === 0) {
    throw new Error('No news articles available for strategic brief generation.');
  }
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Analyze category distribution
  const categoryBreakdown = newsArticles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format the news articles for the AI prompt
  const formattedNews = formatNewsForOpenAI(newsArticles);
  
  const userPrompt = `Generate a strategic briefing for ${currentDate} at ${currentTime} using these focused news articles:

${formattedNews}

BRIEFING REQUIREMENTS:
- MUST start by clearly stating the current time and date: "${currentDate} at ${currentTime}"
- Focus on the three key areas: Technology, Markets/Finance, and International Politics
- Article distribution: ${JSON.stringify(categoryBreakdown)}
- Create a 2-3 minute strategic briefing that:
  1. Opens with current time/date and brief overview of today's key strategic themes
  2. Highlights the most significant developments in each focus area
  3. Makes strategic connections between technology trends, market movements, and political developments
  4. Provides forward-looking insights and implications
  5. Ends with actionable perspective for strategic decision-making

TARGET AUDIENCE: Business leaders, investors, and strategic decision-makers who need to understand how technology, markets, and geopolitics intersect.

Write in a professional, insightful tone optimized for text-to-speech delivery.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: STRATEGIC_BRIEF_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 1200,
    temperature: 0.7, // Balanced temperature for professional yet engaging content
  });

  const briefText = completion.choices[0]?.message?.content?.trim();
  
  if (!briefText) {
    throw new Error('Failed to generate strategic brief content');
  }

  console.log('✅ Generated focused strategic brief successfully');
  return briefText;
};

/**
 * Generate speech audio from text using OpenAI TTS
 */
export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    console.log('🎵 Generating speech with OpenAI TTS...');

    // Check if we have a valid API key
    if (OPENAI_API_KEY === 'demo_key') {
      console.warn('⚠️ OpenAI API key not configured, skipping TTS generation');
      return null;
    }

    const response = await openai.audio.speech.create({
      model: 'tts-1-hd', // Use high-quality model
      voice: 'alloy',
      input: text,
      response_format: 'mp3'
    });

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ Generated high-quality speech audio');
    return audioBuffer;

  } catch (error) {
    console.error('Error generating speech:', error);
    return null; // Return null if TTS fails, app can fall back to system TTS
  }
};

/**
 * Complete focused strategic brief generation using RSS news
 */
export const generateStrategicBrief = async (newsArticles: NewsArticle[]): Promise<{ text: string; audio: ArrayBuffer | null }> => {
  console.log('🧠 Starting focused strategic brief generation (Tech/Markets/Politics)...');
  
  if (!newsArticles || newsArticles.length === 0) {
    throw new Error('No news articles provided for strategic brief generation.');
  }
  
  // Generate the strategic brief text using focused news
  const text = await generateStrategicBriefText(newsArticles);
  
  // Generate high-quality speech audio
  const audio = await generateSpeech(text);
  
  console.log('✅ Complete focused strategic brief generated');
  return { text, audio };
};