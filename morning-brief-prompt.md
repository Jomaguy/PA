# Morning Brief Voice Assistant Prompt

## Overview
This prompt is designed for a one-sided conversational AI that delivers personalized morning briefings through voice synthesis. The AI should act as a knowledgeable, warm, and efficient personal assistant that understands the user's preferences and delivers the most relevant news in a conversational tone.

---

## Core Prompt Structure

### System Instructions
```
You are an expert personal AI assistant specialized in delivering morning briefings. Your role is to provide a concise, engaging, and personalized news summary that can be converted to speech. You should sound like a knowledgeable friend who keeps track of important developments.

IMPORTANT GUIDELINES:
- Speak in a conversational, warm tone
- Keep the entire briefing under 3 minutes when spoken aloud
- Focus only on the most significant news that matters globally
- Use natural speech patterns with appropriate pauses
- Avoid overwhelming technical jargon
- Include emotional context when relevant
- End with a positive or motivational note
```

### Input Parameters
```json
{
  "user_preferences": {
    "interests": ["technology", "AI", "business", "health", "climate"],
    "news_sources": ["reliable_mainstream", "tech_publications"],
    "briefing_length": "2-3 minutes",
    "tone": "conversational_professional",
    "location": "user_timezone",
    "language": "english"
  },
  "current_context": {
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "day_of_week": "string",
    "user_calendar": "optional_today_schedule"
  }
}
```

---

## Conversation Flow Template

### Opening (15-20 seconds)
```
Good morning! It's [DAY], [DATE]. Hope you're starting your day well. Let me catch you up on what's happening in the world right now.
```

### Main News Segment (1.5-2 minutes)
```
The biggest story today is [LEAD_STORY]. Here's what you need to know: [CONCISE_EXPLANATION_WITH_CONTEXT].

In other significant news:
- [SECOND_STORY] - [BRIEF_IMPACT_EXPLANATION]
- [THIRD_STORY] - [WHY_IT_MATTERS]
- [FOURTH_STORY_IF_RELEVANT] - [KEY_TAKEAWAY]

[OPTIONAL: If there's breaking news or developing stories]
And just breaking - [BREAKING_NEWS_SUMMARY]
```

### Closing (15-20 seconds)
```
That's your morning brief for [DATE]. Stay informed, stay curious, and have a great day ahead. Remember, [OPTIONAL_MOTIVATIONAL_CLOSING_THOUGHT].
```

---

## Technical Implementation Strategy

### Most Efficient Approach: **OpenAI TTS API (Recommended)**

**Why This is the Best Option:**
- ✅ **Single Provider**: Both text generation (GPT-4) and voice synthesis (TTS-1-HD)
- ✅ **Cost Effective**: Competitive pricing for both services
- ✅ **High Quality**: Natural-sounding voices with good prosody
- ✅ **Easy Integration**: Single API key and unified SDK
- ✅ **Reliable**: Enterprise-grade uptime and performance

```javascript
// Implementation pseudo-code
const morningBrief = async () => {
  // 1. Fetch latest news from curated sources
  const newsData = await fetchLatestNews();
  
  // 2. Generate briefing text using GPT-4
  const briefingText = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: MORNING_BRIEF_PROMPT },
      { role: "user", content: `Generate morning brief for ${new Date()}` }
    ]
  });
  
  // 3. Convert to speech using OpenAI TTS
  const audioBuffer = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "nova", // Natural, warm female voice
    input: briefingText.choices[0].message.content
  });
  
  // 4. Play audio in React Native
  return audioBuffer;
};
```

### Alternative Options

#### Option 2: ElevenLabs (Premium Quality)
```javascript
// For higher quality voice synthesis
const elevenLabsTTS = async (text) => {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/{voice_id}', {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8
      }
    })
  });
  return response.arrayBuffer();
};
```

#### Option 3: React Native Built-in TTS (Offline)
```javascript
import Tts from 'react-native-tts';

const playBriefing = async (text) => {
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultRate(0.52);
  Tts.setDefaultPitch(1.0);
  Tts.speak(text);
};
```

---

## News Source Integration

### Recommended APIs
1. **NewsAPI** - Free tier for development
2. **Associated Press API** - Reliable, professional news
3. **Reuters API** - Global coverage
4. **Custom RSS aggregation** - Multiple sources

### Sample News Fetching
```javascript
const fetchLatestNews = async () => {
  const sources = [
    'bbc-news',
    'reuters',
    'associated-press',
    'techcrunch',
    'bloomberg'
  ];
  
  const newsData = await fetch(`https://newsapi.org/v2/top-headlines?sources=${sources.join(',')}&apiKey=${NEWS_API_KEY}`);
  return newsData.json();
};
```

---

## Example Output

### Sample Morning Brief Text
```
Good morning! It's Tuesday, August 12th. Hope you're starting your day well. Let me catch you up on what's happening in the world right now.

The biggest story today is the breakthrough in renewable energy storage announced by researchers at MIT. They've developed a new battery technology that could store solar energy for months, potentially revolutionizing how we think about clean energy infrastructure. This could be a game-changer for addressing climate change at scale.

In other significant news:
- Markets are showing mixed signals as investors react to the latest inflation data, with tech stocks leading the way up while traditional sectors face headwinds
- A major cybersecurity incident affecting several government agencies has been contained, but it's highlighting the ongoing challenges in digital infrastructure protection
- And in health news, new research from Johns Hopkins shows promising results for an Alzheimer's treatment that could slow cognitive decline by up to 40%

That's your morning brief for August 12th. Stay informed, stay curious, and have a great day ahead. Remember, every challenge is an opportunity to learn and grow.
```

---

## Voice Optimization Notes

### Speaking Pace and Clarity
- Target 150-160 words per minute
- Add natural pauses with commas and periods
- Use shorter sentences for better comprehension
- Include conversational fillers like "Now," "Meanwhile," "Also"

### Emotional Tone Markers
```
NEUTRAL: Standard delivery
URGENT: Slightly faster pace, clearer enunciation
POSITIVE: Warmer tone, slight uplift
CONCERNING: More serious tone, slower pace
BREAKING: Attention-grabbing, clear emphasis
```

---

## React Native Integration

### Required Dependencies
```bash
npm install openai react-native-sound
# For environment variables
npm install react-native-dotenv
# For news API
npm install axios
```

### Environment Configuration
```javascript
// .env file
OPENAI_API_KEY=your_openai_api_key_here
NEWS_API_KEY=your_news_api_key_here
```

### Component Integration
```javascript
// Add to MorningBriefContent component
const VoiceBriefButton = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const playMorningBrief = async () => {
    setIsLoading(true);
    try {
      // Implementation here
      const audioBuffer = await generateAndPlayBrief();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing brief:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.voiceButton} 
      onPress={playMorningBrief}
      disabled={isLoading}
    >
      <Text style={styles.voiceButtonText}>
        {isLoading ? '🔄 Generating...' : '🎧 Play Morning Brief'}
      </Text>
    </TouchableOpacity>
  );
};
```

---

## Future Enhancements

### Personalization Features
- Learn from user interaction patterns
- Adjust news categories based on engagement
- Customize speaking pace and voice preferences
- Include local news based on location
- Calendar integration for relevant business news

### Advanced Capabilities
- Multi-language support
- Voice command interactions ("Tell me more about...")
- Summary length customization
- News source preference learning
- Mood-based tone adjustment

---

## Privacy and Ethical Considerations

### Data Handling
- Minimize data collection to essential preferences only
- Implement local storage for user preferences
- Transparent about news source selection
- Option for users to exclude sensitive topics

### Bias Mitigation
- Use multiple, diverse news sources
- Clearly attribute information to sources
- Avoid inflammatory language
- Present facts without political bias
- Include international perspectives

---

## Implementation Checklist

- [ ] Create OpenAI API account and get API key
- [ ] Set up NewsAPI account for news feeds
- [ ] Install required npm packages
- [ ] Configure environment variables
- [ ] Add voice button to Morning Brief tab
- [ ] Implement news fetching service
- [ ] Create TTS integration
- [ ] Test audio playback on device
- [ ] Add loading states and error handling
- [ ] Implement user preferences storage

---

*This prompt is designed to create an engaging, informative, and personalized morning brief experience that respects the user's time while keeping them informed about the world's most important developments.*
