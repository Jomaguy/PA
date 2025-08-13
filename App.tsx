import React, { useState, useRef } from 'react';
import { 
  View,
  Text, 
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
  Alert 
} from 'react-native';

// Import RSS news service and OpenAI service
import { getMorningBriefNews, NewsArticle } from './services/rssNewsService';
import { generateStrategicBrief } from './services/openaiService';
import { playAudioFromBuffer, speakText, stopSpeaking, AudioPlayer } from './services/audioService';

const { width, height } = Dimensions.get('window');

type TabType = 'welcome' | 'brief' | 'todo' | 'protocols';

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>('welcome');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'welcome':
        return <WelcomeContent />;
      case 'brief':
        return <StrategicBriefContent />;
      case 'todo':
        return <TodoContent />;
      case 'protocols':
        return <ProtocolsContent />;
      default:
        return <WelcomeContent />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personal AI Assistant</Text>
        <Text style={styles.headerSubtitle}>Your intelligent companion</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'welcome' && styles.activeTab]}
          onPress={() => setActiveTab('welcome')}
        >
          <Text style={[styles.tabText, activeTab === 'welcome' && styles.activeTabText]}>
            🏠 Welcome
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'brief' && styles.activeTab]}
          onPress={() => setActiveTab('brief')}
        >
          <Text style={[styles.tabText, activeTab === 'brief' && styles.activeTabText]}>
            🧠 Brief
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'todo' && styles.activeTab]}
          onPress={() => setActiveTab('todo')}
        >
          <Text style={[styles.tabText, activeTab === 'todo' && styles.activeTabText]}>
            ✅ Todos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'protocols' && styles.activeTab]}
          onPress={() => setActiveTab('protocols')}
        >
          <Text style={[styles.tabText, activeTab === 'protocols' && styles.activeTabText]}>
            📋 Protocols
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const WelcomeContent = () => (
  <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>Welcome to Your AI Assistant</Text>
      <Text style={styles.welcomeSubtitle}>
        Your personal AI companion is ready to help you start each day with intelligence and purpose.
      </Text>
      
      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🧠</Text>
          <Text style={styles.featureTitle}>Strategic Briefings</Text>
          <Text style={styles.featureDescription}>
            Get focused briefings anytime on Technology, Markets, and International Politics from trusted sources
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>✅</Text>
          <Text style={styles.featureTitle}>Smart Todo Management</Text>
          <Text style={styles.featureDescription}>
            AI-powered task organization and priority suggestions
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📋</Text>
          <Text style={styles.featureTitle}>Personal Protocols</Text>
          <Text style={styles.featureDescription}>
            Create and manage your daily routines and best practices
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureTitle}>Goal Tracking</Text>
          <Text style={styles.featureDescription}>
            Monitor progress and get AI insights on your objectives
          </Text>
        </View>
      </View>
    </View>
  </ScrollView>
);

const StrategicBriefContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [briefText, setBriefText] = useState<string>('');
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  const playStrategicBrief = async (): Promise<void> => {
    console.log('🎧 Play Strategic Brief button pressed!');
    
    if (isPlaying) {
      console.log('⏸️ Stopping strategic brief...');
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop();
      }
      stopSpeaking();
      setIsPlaying(false);
      setBriefText('');
      setLoadingStage('');
      Alert.alert('Stopped', 'Strategic brief stopped.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Stage 1: Fetch focused news from RSS sources
      setLoadingStage('🔍 Fetching focused news: Tech, Markets, Politics...');
      console.log('📰 Fetching focused news from RSS sources...');
      const newsArticles = await getMorningBriefNews();
      
      if (!newsArticles || newsArticles.length === 0) {
        throw new Error('No relevant news articles available from RSS sources');
      }
      
      console.log(`✅ Retrieved ${newsArticles.length} focused articles from RSS sources`);

      // Stage 2: Generate strategic AI brief using focused news
      setLoadingStage('🧠 Creating strategic brief with AI analysis...');
      console.log('🤖 Generating strategic brief with focused RSS news...');
      const { text, audio } = await generateStrategicBrief(newsArticles);
      
      if (!text) {
        throw new Error('Failed to generate strategic brief');
      }

      setBriefText(text);

      // Stage 3: Play audio
      if (audio) {
        setLoadingStage('🎵 Preparing high-quality audio...');
        console.log('🎵 Playing OpenAI TTS audio...');
        
        try {
        const audioPlayer = await playAudioFromBuffer(audio);
        if (audioPlayer) {
            audioPlayerRef.current = audioPlayer;
          await audioPlayer.play();
          setIsPlaying(true);
            setLoadingStage('');
            console.log('✅ Audio playback started');
            Alert.alert('Success! 🎉', 'Your strategic brief is ready. Audio is now playing!');
        } else {
            throw new Error('Audio player creation failed');
          }
        } catch (audioError) {
          console.warn('⚠️ High-quality audio failed, using fallback TTS:', audioError);
          setLoadingStage('🗣️ Using system text-to-speech...');
          speakText(text);
          setIsPlaying(true);
          Alert.alert('Success! 🎉', 'Your strategic brief is ready. Using system voice.');
        }
      } else {
        console.log('🗣️ Using system text-to-speech fallback...');
        setLoadingStage('🗣️ Using system text-to-speech...');
        speakText(text);
        setIsPlaying(true);
        Alert.alert('Success! 🎉', 'Your strategic brief is ready. Using system voice.');
      }

    } catch (error) {
      console.error('❌ Error generating strategic brief:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Unable to generate strategic brief: ${errorMessage}`);
      Alert.alert(
        'Error', 
        `Unable to generate strategic brief: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.centerContainer}>
        <Text style={styles.sectionTitle}>🌅 Strategic Brief</Text>
        
        <View style={styles.topicsList}>
          <Text style={styles.topicsTitle}>Focus Areas:</Text>
          <View style={styles.topicsContainer}>
            <View style={styles.topicTag}>
              <Text style={styles.topicEmoji}>🔬</Text>
              <Text style={styles.topicText}>Technology</Text>
            </View>
            <View style={styles.topicTag}>
              <Text style={styles.topicEmoji}>📈</Text>
              <Text style={styles.topicText}>Markets</Text>
            </View>
            <View style={styles.topicTag}>
              <Text style={styles.topicEmoji}>🌍</Text>
              <Text style={styles.topicText}>Int'l Politics</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.voiceContainer}>
          <TouchableOpacity 
            style={[styles.voiceButton, isLoading && styles.voiceButtonDisabled]}
            onPress={playStrategicBrief}
            disabled={isLoading}
          >
            <Text style={styles.voiceButtonIcon}>
              {isLoading ? '🔄' : isPlaying ? '⏸️' : '🎧'}
            </Text>
            <Text style={styles.voiceButtonText}>
              {isLoading ? loadingStage || 'Generating Brief...' : 
               isPlaying ? 'Stop Brief' : 
               'Play Strategic Brief'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.voiceDescription}>
            {isLoading 
              ? 'Analyzing focused news from Technology, Markets, and International Politics...'
              : 'Get your strategic briefing anytime, focused on the three areas that matter most for decision-making'
            }
          </Text>
          
          {error && (
            <Text style={styles.errorText}>
              ⚠️ {error}
            </Text>
          )}
        </View>

        {briefText && (
          <View style={styles.briefTextCard}>
            <Text style={styles.briefTextTitle}>📝 Today's Strategic Brief</Text>
            <ScrollView style={styles.briefTextScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.briefTextContent}>
              {briefText}
            </Text>
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const TodoContent = () => (
  <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <View style={styles.featuresContainer}>
      <Text style={styles.sectionTitle}>✅ Smart Todos</Text>
      
      <View style={styles.featureCard}>
        <Text style={styles.featureIcon}>🎯</Text>
        <Text style={styles.featureTitle}>Priority Tasks</Text>
        <Text style={styles.featureDescription}>
          • Complete project proposal
          • Review client feedback
          • Schedule team meeting
        </Text>
      </View>
      
      <View style={styles.featureCard}>
        <Text style={styles.featureIcon}>⏰</Text>
        <Text style={styles.featureTitle}>Time-Sensitive</Text>
        <Text style={styles.featureDescription}>
          • Submit expense report (Due: Today)
          • Call insurance company (Due: Tomorrow)
          • Book restaurant reservation (Due: This week)
        </Text>
      </View>
      
      <View style={styles.featureCard}>
        <Text style={styles.featureIcon}>💡</Text>
        <Text style={styles.featureTitle}>AI Suggestions</Text>
        <Text style={styles.featureDescription}>
          Based on your patterns, consider:
          • Batch similar tasks together
          • Schedule creative work for mornings
          • Set aside time for strategic planning
        </Text>
      </View>
    </View>
  </ScrollView>
);

const ProtocolsContent = () => (
  <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <View style={styles.featuresContainer}>
      <Text style={styles.sectionTitle}>📋 Personal Protocols</Text>
      
      <View style={styles.featureCard}>
        <Text style={styles.featureIcon}>🌅</Text>
        <Text style={styles.featureTitle}>Morning Routine</Text>
        <Text style={styles.featureDescription}>
          • 6:00 AM - Wake up & hydrate
          • 6:15 AM - Meditation (10 min)
          • 6:30 AM - Exercise (30 min)
          • 7:00 AM - Shower & breakfast
          • 7:30 AM - Review daily priorities
        </Text>
      </View>
      
      <View style={styles.featureCard}>
        <Text style={styles.featureIcon}>💼</Text>
        <Text style={styles.featureTitle}>Work Protocol</Text>
        <Text style={styles.featureDescription}>
          • Deep work blocks: 9-11 AM, 2-4 PM
          • Email batches: 11 AM, 4 PM, 6 PM
          • Weekly planning: Friday 3-4 PM
          • Monthly review: Last Friday of month
        </Text>
      </View>
      
      <View style={styles.featureCard}>
        <Text style={styles.featureIcon}>🌙</Text>
        <Text style={styles.featureTitle}>Evening Routine</Text>
        <Text style={styles.featureDescription}>
          • 8:00 PM - No more screens
          • 8:30 PM - Journal & reflect
          • 9:00 PM - Reading
          • 9:30 PM - Prepare for tomorrow
          • 10:00 PM - Sleep
        </Text>
      </View>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a8a8a8',
    textAlign: 'center',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabText: {
    color: '#a8a8a8',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#e94560',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#a8a8a8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresGrid: {
    gap: 16,
  },
  featuresContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  topicsList: {
    marginBottom: 30,
    alignItems: 'center',
  },
  topicsTitle: {
    fontSize: 16,
    color: '#a8a8a8',
    marginBottom: 12,
    textAlign: 'center',
  },
  topicsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  topicTag: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  topicEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  topicText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  featureCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  featureIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#a8a8a8',
    textAlign: 'center',
    lineHeight: 20,
  },
  voiceContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 32,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#16213e',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  voiceButton: {
    backgroundColor: '#e94560',
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 250,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  voiceButtonDisabled: {
    backgroundColor: '#6b7280',
    shadowColor: '#6b7280',
  },
  voiceButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  voiceButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  voiceDescription: {
    marginTop: 20,
    fontSize: 16,
    color: '#a8a8a8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  briefTextCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#16213e',
    width: '100%',
    maxWidth: 600,
    maxHeight: 400,
  },
  briefTextTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  briefTextScroll: {
    maxHeight: 300,
  },
  briefTextContent: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
    textAlign: 'left',
  },
});

export default App;