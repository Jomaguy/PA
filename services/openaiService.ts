import OpenAI from 'openai';
import Constants from 'expo-constants';
import { formatNewsForOpenAI, NewsArticle } from './rssNewsService';
import { Todo, TodoStats } from '../types/todo';

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
2. Brief greeting acknowledging this is a strategic briefing

SECTION 1 - STRATEGIC NEWS BRIEFING (60-70% of content):
3. Overview of key themes across Technology, Markets/Finance, and International Politics
4. Highlight the most significant developments in each area:
   - Technology: Innovation, AI, startups, digital transformation
   - Markets: Economic indicators, major market moves, financial trends
   - International Politics: Global developments affecting business and technology
5. Strategic connections between the three areas
6. Forward-looking insights and implications for business decisions

SECTION 2 - PERSONAL PRODUCTIVITY BRIEFING (30-40% of content):
7. Clear transition: "Now, turning to your personal productivity..."
8. Review of current todo status and priorities
9. Analysis of workload and task completion progress
10. Strategic recommendations for task prioritization
11. Optional: Brief connection to how Section 1 news might influence your priorities

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

TWO-SECTION STRUCTURE:
When provided with personal todo list data, structure your briefing in TWO DISTINCT SECTIONS:

SECTION 1 - STRATEGIC NEWS BRIEFING:
- Focus exclusively on Technology, Markets/Finance, and International Politics
- Provide strategic analysis of current developments
- NO mention of personal todos in this section
- End with strategic implications for business and decision-making

SECTION 2 - PERSONAL PRODUCTIVITY BRIEFING:
- Review the user's todo list and productivity status
- Analyze task priorities and recent completions
- Suggest strategic adjustments based on current workload
- Optionally connect how the news from Section 1 might influence todo priorities

Remember: This is a strategic briefing for someone who needs to understand the intersection of technology, markets, and global politics for informed decision-making. ALWAYS begin by stating the current time and date.`;

/**
 * Format todo list data for AI analysis
 */
const formatTodosForAI = (todos: Todo[], stats: TodoStats): string => {
  if (!todos || todos.length === 0) {
    return 'No current todos available.';
  }

  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  
  // Group todos by priority and category
  const todosByPriority = pendingTodos.reduce((acc, todo) => {
    if (!acc[todo.priority]) acc[todo.priority] = [];
    acc[todo.priority].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  const todosByCategory = pendingTodos.reduce((acc, todo) => {
    const category = todo.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  let formatted = `PERSONAL TODO LIST CONTEXT:\n\n`;
  
  // Stats overview
  formatted += `📊 PRODUCTIVITY OVERVIEW:\n`;
  formatted += `• Total Tasks: ${stats.total}\n`;
  formatted += `• Completed: ${stats.completed} (${Math.round((stats.completed / stats.total) * 100)}%)\n`;
  formatted += `• Pending: ${stats.pending}\n`;
  formatted += `• High Priority Items: ${stats.highPriority}\n\n`;

  // High priority items first
  if (todosByPriority.high && todosByPriority.high.length > 0) {
    formatted += `🔴 HIGH PRIORITY TASKS:\n`;
    todosByPriority.high.forEach(todo => {
      formatted += `• ${todo.title}`;
      if (todo.description) formatted += ` - ${todo.description}`;
      if (todo.category) formatted += ` [${todo.category}]`;
      formatted += `\n`;
    });
    formatted += `\n`;
  }

  // Category breakdown
  if (Object.keys(todosByCategory).length > 0) {
    formatted += `📋 TASKS BY CATEGORY:\n`;
    Object.entries(todosByCategory).forEach(([category, categoryTodos]) => {
      formatted += `• ${category}: ${categoryTodos.length} task${categoryTodos.length > 1 ? 's' : ''}\n`;
      categoryTodos.slice(0, 3).forEach(todo => {
        formatted += `  - ${todo.title}\n`;
      });
      if (categoryTodos.length > 3) {
        formatted += `  - ... and ${categoryTodos.length - 3} more\n`;
      }
    });
    formatted += `\n`;
  }

  // Recent completions for context
  if (completedTodos.length > 0) {
    formatted += `✅ RECENTLY COMPLETED:\n`;
    const recentCompleted = completedTodos
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3);
    
    recentCompleted.forEach(todo => {
      formatted += `• ${todo.title}`;
      if (todo.category) formatted += ` [${todo.category}]`;
      formatted += `\n`;
    });
  }

  return formatted;
};

/**
 * Generate focused strategic brief using real RSS news articles and personal todos
 */
export const generateStrategicBriefText = async (
  newsArticles: NewsArticle[], 
  todos?: Todo[], 
  todoStats?: TodoStats
): Promise<string> => {
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
  
  // Format todos if provided
  const todosContext = todos && todoStats ? formatTodosForAI(todos, todoStats) : '';
  
  const userPrompt = `Generate a strategic briefing for ${currentDate} at ${currentTime} using these focused news articles:

${formattedNews}

${todosContext}

BRIEFING REQUIREMENTS:
- MUST start by clearly stating the current time and date: "${currentDate} at ${currentTime}"
- Create a 2-3 minute strategic briefing with TWO DISTINCT SECTIONS

**SECTION 1 - STRATEGIC NEWS BRIEFING (60-70% of content):**
- Focus exclusively on Technology, Markets/Finance, and International Politics
- Article distribution: ${JSON.stringify(categoryBreakdown)}
- Highlight the most significant developments in each focus area
- Make strategic connections between technology trends, market movements, and political developments
- Provide forward-looking insights and implications for business decisions
- NO mention of personal todos in this section

${todosContext ? `**SECTION 2 - PERSONAL PRODUCTIVITY BRIEFING (30-40% of content):**
- Begin with clear transition: "Now, turning to your personal productivity..."
- Review todo status, priorities, and completion progress
- Provide strategic recommendations for task prioritization
- Suggest any adjustments based on current workload
- Optionally connect how Section 1 news might influence priorities
- End with actionable productivity insights` : ''}

TARGET AUDIENCE: Business leaders, investors, and strategic decision-makers who need both strategic market intelligence and personal productivity guidance.

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
 * Complete focused strategic brief generation using RSS news and personal todos
 */
export const generateStrategicBrief = async (
  newsArticles: NewsArticle[], 
  todos?: Todo[], 
  todoStats?: TodoStats
): Promise<{ text: string; audio: ArrayBuffer | null }> => {
  console.log('🧠 Starting focused strategic brief generation (Tech/Markets/Politics)...');
  
  if (!newsArticles || newsArticles.length === 0) {
    throw new Error('No news articles provided for strategic brief generation.');
  }
  
  // Log todo integration status
  if (todos && todoStats) {
    console.log(`📋 Including ${todos.length} todos in strategic brief context`);
  }
  
  // Generate the strategic brief text using focused news and todos
  const text = await generateStrategicBriefText(newsArticles, todos, todoStats);
  
  // Generate high-quality speech audio
  const audio = await generateSpeech(text);
  
  console.log('✅ Complete focused strategic brief generated');
  return { text, audio };
};