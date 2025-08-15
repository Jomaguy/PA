// RSS-based news service - focused on technology, markets, and international politics
// Fetches real news from trusted RSS sources with topic filtering

import { Platform } from 'react-native';

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  source: {
    name: string;
  };
  url: string;
  category: string;
}

/**
 * Focused RSS news sources - technology, markets, and international politics
 */
const RSS_SOURCES = [
  // Technology Sources
  {
    name: 'TechCrunch',
    url: 'https://feeds.feedburner.com/TechCrunch/',
    category: 'technology'
  },
  {
    name: 'Reuters Tech',
    url: 'http://feeds.reuters.com/reuters/technologyNews',
    category: 'technology'
  },
  {
    name: 'BBC Technology',
    url: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'technology'
  },
  
  // Markets/Finance Sources
  {
    name: 'Reuters Business',
    url: 'http://feeds.reuters.com/reuters/businessNews',
    category: 'markets'
  },
  {
    name: 'BBC Business',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'markets'
  },
  {
    name: 'MarketWatch',
    url: 'http://feeds.marketwatch.com/marketwatch/topstories/',
    category: 'markets'
  },
  
  // International Politics Sources
  {
    name: 'Reuters World News',
    url: 'http://feeds.reuters.com/Reuters/worldNews',
    category: 'international-politics'
  },
  {
    name: 'BBC World News',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'international-politics'
  },
  {
    name: 'AP International',
    url: 'https://feeds.apnews.com/rss/apf-intlnews',
    category: 'international-politics'
  }
];

/**
 * Keywords to identify relevant articles for each category
 */
const TOPIC_KEYWORDS = {
  technology: [
    'AI', 'artificial intelligence', 'machine learning', 'tech', 'technology', 'software', 'hardware',
    'startup', 'innovation', 'digital', 'app', 'platform', 'cloud', 'data', 'cybersecurity',
    'blockchain', 'cryptocurrency', 'bitcoin', 'programming', 'developer', 'coding', 'internet',
    'smartphone', 'computer', 'algorithm', 'automation', 'robotics', 'virtual reality', 'AR'
  ],
  markets: [
    'stock', 'market', 'trading', 'investment', 'finance', 'economic', 'economy', 'GDP',
    'inflation', 'interest rate', 'federal reserve', 'NYSE', 'NASDAQ', 'S&P', 'dow jones',
    'earnings', 'revenue', 'profit', 'loss', 'billion', 'million', 'valuation', 'IPO',
    'merger', 'acquisition', 'commodity', 'oil', 'gold', 'currency', 'dollar', 'euro'
  ],
  'international-politics': [
    'government', 'political', 'politics', 'president', 'minister', 'parliament', 'congress',
    'election', 'voting', 'diplomatic', 'diplomacy', 'international', 'global', 'world',
    'country', 'nation', 'foreign', 'policy', 'treaty', 'agreement', 'sanctions', 'trade war',
    'conflict', 'war', 'peace', 'security', 'defense', 'military', 'alliance', 'summit'
  ]
};

/**
 * Check if an article is relevant to our focus topics
 */
const isRelevantArticle = (title: string, description: string, sourcCategory: string): boolean => {
  const text = `${title} ${description}`.toLowerCase();
  
  // First check if it matches the source category keywords
  const categoryKeywords = TOPIC_KEYWORDS[sourcCategory as keyof typeof TOPIC_KEYWORDS];
  if (categoryKeywords) {
    const hasKeyword = categoryKeywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    if (hasKeyword) return true;
  }
  
  // Also check against all categories to catch cross-category relevant news
  for (const [category, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const hasKeyword = keywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    if (hasKeyword) return true;
  }
  
  return false;
};

/**
 * Determine the best category for an article based on content
 */
const categorizeArticle = (title: string, description: string, sourceCategory: string): string => {
  const text = `${title} ${description}`.toLowerCase();
  let bestCategory = sourceCategory;
  let maxMatches = 0;
  
  for (const [category, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const matches = keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }
  
  return bestCategory;
};

/**
 * Parse RSS XML to extract articles with topic filtering
 */
const parseRSSFeed = (xmlText: string, sourceName: string, sourceCategory: string): NewsArticle[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.querySelectorAll('item');
    
    const articles: NewsArticle[] = [];
    
    items.forEach((item) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const description = item.querySelector('description')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
      const author = item.querySelector('author')?.textContent?.trim() || sourceName;
      
      if (title && description) {
        // Clean up description (remove HTML tags if present)
        const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
        
        // Only include articles relevant to our focus topics
        if (isRelevantArticle(title, cleanDescription, sourceCategory)) {
          const articleCategory = categorizeArticle(title, cleanDescription, sourceCategory);
          
          articles.push({
            title,
            description: cleanDescription,
            content: cleanDescription,
            author,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            source: { name: sourceName },
            url: link,
            category: articleCategory
          });
        }
      }
    });
    
    return articles;
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
};

/**
 * Fetch RSS feed with CORS proxy for web compatibility
 */
const fetchRSSFeed = async (rssUrl: string, sourceName: string, sourceCategory: string): Promise<NewsArticle[]> => {
  try {
    console.log(`📡 Fetching ${sourceCategory} news from ${sourceName}...`);
    
    // Use CORS proxy for web compatibility
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const xmlContent = data.contents;
    
    if (!xmlContent) {
      throw new Error('No content received from RSS feed');
    }
    
    const articles = parseRSSFeed(xmlContent, sourceName, sourceCategory);
    console.log(`✅ Retrieved ${articles.length} relevant ${sourceCategory} articles from ${sourceName}`);
    
    return articles;
    
  } catch (error) {
    console.error(`❌ Error fetching RSS feed from ${sourceName}:`, error);
    return [];
  }
};

/**
 * Fetch news from focused RSS sources and aggregate them
 */
export const fetchLatestNews = async (): Promise<NewsArticle[]> => {
  console.log('📰 Fetching focused news: Technology, Markets, International Politics...');
  
  try {
    // Fetch from multiple sources in parallel
    const promises = RSS_SOURCES.map(source => 
      fetchRSSFeed(source.url, source.name, source.category)
    );
    
    const results = await Promise.allSettled(promises);
    
    // Combine all successful results
    const allArticles: NewsArticle[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allArticles.push(...result.value);
      } else if (result.status === 'rejected') {
        console.warn(`Failed to fetch from ${RSS_SOURCES[index].name}:`, result.reason);
      }
    });
    
    if (allArticles.length === 0) {
      throw new Error('No relevant articles could be retrieved from any RSS source');
    }
    
    // Sort by publication date (newest first) and limit to top articles
    const sortedArticles = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 15); // Top 15 most recent relevant articles
    
    console.log(`✅ Successfully aggregated ${sortedArticles.length} focused articles from ${RSS_SOURCES.length} sources`);
    
    // Log category breakdown
    const categoryBreakdown = sortedArticles.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Category breakdown:', categoryBreakdown);
    
    return sortedArticles;
    
  } catch (error) {
    console.error('❌ Error fetching focused RSS news:', error);
    throw error;
  }
};

/**
 * Get strategic brief news - balanced across all three focus topics
 */
export const getMorningBriefNews = async (): Promise<NewsArticle[]> => {
  try {
    console.log('🧠 Getting focused strategic brief news...');
    const articles = await fetchLatestNews();
    
    // Ensure balanced representation across all three topics
    const articlesByCategory = articles.reduce((acc, article) => {
      if (!acc[article.category]) acc[article.category] = [];
      acc[article.category].push(article);
      return acc;
    }, {} as Record<string, NewsArticle[]>);
    
    const briefArticles: NewsArticle[] = [];
    const targetCategories = ['technology', 'markets', 'international-politics'];
    
    // Get 2 articles from each category (6 total), prioritizing newest
    for (const category of targetCategories) {
      const categoryArticles = articlesByCategory[category] || [];
      const selectedArticles = categoryArticles
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 2);
      
      briefArticles.push(...selectedArticles);
    }
    
    // If we don't have enough, fill with the most recent from any category
    while (briefArticles.length < 6 && briefArticles.length < articles.length) {
      const remainingArticles = articles.filter(article => 
        !briefArticles.some(brief => brief.title === article.title)
      );
      
      if (remainingArticles.length === 0) break;
      
      briefArticles.push(remainingArticles[0]);
    }
    
    // Final sort by publication date
    const finalBrief = briefArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6);
    
    console.log(`✅ Selected ${finalBrief.length} balanced articles for strategic brief`);
    
    // Log final category breakdown
    const finalBreakdown = finalBrief.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Final strategic brief breakdown:', finalBreakdown);
    
    return finalBrief;
    
  } catch (error) {
    console.error('❌ Error getting focused strategic brief news:', error);
    throw error;
  }
};

/**
 * Format news articles for OpenAI prompt with category context
 */
export const formatNewsForOpenAI = (articles: NewsArticle[]): string => {
  if (articles.length === 0) {
    return 'No current news articles available.';
  }
  
  // Group by category for better organization
  const articlesByCategory = articles.reduce((acc, article) => {
    if (!acc[article.category]) acc[article.category] = [];
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, NewsArticle[]>);
  
  let formattedNews = 'Today\'s focused news covering Technology, Markets, and International Politics:\n\n';
  
  const categoryTitles = {
    'technology': '🔬 TECHNOLOGY',
    'markets': '📈 MARKETS & FINANCE',
    'international-politics': '🌍 INTERNATIONAL POLITICS'
  };
  
  for (const [category, categoryArticles] of Object.entries(articlesByCategory)) {
    const title = categoryTitles[category as keyof typeof categoryTitles] || category.toUpperCase();
    formattedNews += `${title}:\n`;
    
    categoryArticles.forEach((article, index) => {
      const sourceInfo = article.source.name;
      const timeInfo = new Date(article.publishedAt).toLocaleDateString();
      
      formattedNews += `${index + 1}. **${article.title}** (${sourceInfo} - ${timeInfo})\n   ${article.description}\n\n`;
    });
    
    formattedNews += '\n';
  }
  
  return formattedNews;
};

/**
 * Get a summary of current news topics for display with categories
 */
export const getNewsTopics = (articles: NewsArticle[]): string[] => {
  return articles.slice(0, 4).map(article => `[${article.category.toUpperCase()}] ${article.title}`);
};

/**
 * Health check for RSS sources with platform-aware testing
 */
export const checkRSSSourcesHealth = async (): Promise<{working: number, total: number, byCategory: Record<string, number>}> => {
  console.log(`🔍 Checking focused RSS sources health (${Platform.OS} platform)...`);
  
  const promises = RSS_SOURCES.map(async (source) => {
    try {
      const articles = await fetchRSSFeed(source.url, source.name, source.category);
      return { success: articles.length > 0, category: source.category, name: source.name };
    } catch (error) {
      console.log(`❌ Health check failed for ${source.name}:`, error.message);
      return { success: false, category: source.category, name: source.name };
    }
  });
  
  const results = await Promise.allSettled(promises);
  const working = results.filter(r => r.status === 'fulfilled' && r.value.success === true).length;
  
  // Count working sources by category
  const byCategory: Record<string, number> = {};
  const workingSources: string[] = [];
  const failingSources: string[] = [];
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const category = result.value.category;
      if (!byCategory[category]) byCategory[category] = 0;
      if (result.value.success) {
        byCategory[category]++;
        workingSources.push(result.value.name);
      } else {
        failingSources.push(result.value.name);
      }
    }
  });
  
  console.log(`📊 RSS Health (${Platform.OS}): ${working}/${RSS_SOURCES.length} sources working`);
  console.log('📊 By category:', byCategory);
  console.log('✅ Working sources:', workingSources);
  if (failingSources.length > 0) {
    console.log('❌ Failing sources:', failingSources);
  }
  
  return { working, total: RSS_SOURCES.length, byCategory };
};