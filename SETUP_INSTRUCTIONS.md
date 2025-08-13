# Morning Brief Voice Feature - Setup Instructions

## 🚀 Quick Start

Your AI Personal Assistant now has a voice-enabled morning brief feature! Here's how to get it running:

### 1. Get API Keys

#### OpenAI API Key (Required for voice generation)
1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

#### NewsAPI Key (Optional - for real news)
1. Go to [NewsAPI](https://newsapi.org/register)
2. Register for a free account
3. Copy your API key from the dashboard

### 2. Configure Environment Variables

Edit the `.env` file in your project root:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-key-here

# News API Configuration  
NEWS_API_KEY=your-actual-newsapi-key-here

# App Configuration
APP_ENV=development
```

### 3. Test the Feature

1. Start your app: `npm run web`
2. Navigate to the "Morning Brief" tab
3. Click the "🎧 Play Morning Brief" button
4. Listen to your personalized AI-generated news briefing!

## 🎯 How It Works

The morning brief feature:

1. **Fetches Latest News** - Gets top headlines from reliable sources
2. **Generates Personalized Brief** - Uses GPT-4 to create a conversational summary
3. **Converts to Speech** - Uses OpenAI's TTS API for natural voice
4. **Plays Audio** - Streams the audio directly in your browser

## 🔧 Fallback Options

If you don't have API keys yet, the app will still work with:
- **Mock news data** - Sample headlines for demonstration
- **Browser text-to-speech** - Built-in voice synthesis
- **Default brief text** - Pre-written morning brief example

## 📱 Platform Support

- ✅ **Web Browser** - Full functionality with OpenAI TTS
- ✅ **React Native** - Uses built-in device TTS
- ✅ **iOS/Android** - Native voice synthesis fallback

## 🎨 Features

- **Smart Loading States** - Shows progress while generating
- **Voice Controls** - Play/pause functionality
- **Live News Headlines** - Real-time news integration
- **Brief Text Preview** - See the generated text
- **Error Handling** - Graceful fallbacks for API issues

## 💡 Tips

1. **Best Voice Quality**: Use OpenAI TTS API for most natural sound
2. **Cost Optimization**: Mock data mode for development/testing
3. **Personalization**: Edit the system prompt in `services/openaiService.ts`
4. **News Sources**: Customize sources in `services/newsService.ts`

## 🔒 Privacy & Security

- API keys are stored locally in `.env` file
- No personal data sent to external services
- News data is fetched in real-time, not stored
- Voice generation happens on-demand

## 🆘 Troubleshooting

### "Unable to generate morning brief" error
- Check that your OpenAI API key is valid
- Ensure you have sufficient API credits
- Verify the `.env` file is properly formatted

### No voice playback
- Try the browser's built-in text-to-speech fallback
- Check browser permissions for audio
- Ensure speakers/headphones are working

### News not loading
- Check NewsAPI key and quota
- App works with mock data if API is unavailable
- Verify internet connection

## 🚀 Next Steps

Want to enhance the feature? Check out:
- `morning-brief-prompt.md` - Complete implementation guide
- `services/` folder - All the AI and audio services
- Customize voice, news sources, and briefing style

Happy briefing! 🌅
