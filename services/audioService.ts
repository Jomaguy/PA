import { Platform } from 'react-native';

/**
 * Audio service for playing morning brief speech
 * This provides a unified interface for audio playback across platforms
 */

export interface AudioPlayer {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  getDuration: () => Promise<number>;
  getCurrentTime: () => Promise<number>;
}

/**
 * Play audio from ArrayBuffer
 */
export const playAudioFromBuffer = async (audioBuffer: ArrayBuffer): Promise<AudioPlayer | null> => {
  try {
    if (Platform.OS === 'web') {
      return playWebAudio(audioBuffer);
    } else {
      // For React Native mobile, we'd use react-native-sound or expo-av
      return playMobileAudio(audioBuffer);
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    return null;
  }
};

/**
 * Web audio implementation
 */
const playWebAudio = (audioBuffer: ArrayBuffer): Promise<AudioPlayer> => {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      audioContext.decodeAudioData(audioBuffer)
        .then(decodedData => {
          const source = audioContext.createBufferSource();
          source.buffer = decodedData;
          source.connect(audioContext.destination);
          
          let isPlaying = false;
          let startTime = 0;
          let pauseTime = 0;
          
          const audioPlayer: AudioPlayer = {
            play: async () => {
              if (!isPlaying) {
                source.start(0, pauseTime);
                startTime = audioContext.currentTime - pauseTime;
                isPlaying = true;
              }
            },
            pause: () => {
              if (isPlaying) {
                pauseTime = audioContext.currentTime - startTime;
                source.stop();
                isPlaying = false;
              }
            },
            stop: () => {
              if (isPlaying) {
                source.stop();
                isPlaying = false;
                pauseTime = 0;
              }
            },
            getDuration: async () => {
              return decodedData.duration;
            },
            getCurrentTime: async () => {
              if (isPlaying) {
                return audioContext.currentTime - startTime;
              }
              return pauseTime;
            }
          };
          
          resolve(audioPlayer);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Mobile audio implementation (React Native)
 */
const playMobileAudio = async (audioBuffer: ArrayBuffer): Promise<AudioPlayer> => {
  // For mobile implementation, you would typically:
  // 1. Save the audio buffer to a temporary file
  // 2. Use react-native-sound or expo-av to play the file
  // This is a simplified placeholder implementation
  
  console.log('Mobile audio playback not implemented yet');
  
  // Return a mock player for development
  return {
    play: async () => {
      console.log('Playing audio on mobile...');
    },
    pause: () => {
      console.log('Pausing audio...');
    },
    stop: () => {
      console.log('Stopping audio...');
    },
    getDuration: async () => 180, // Mock 3 minutes
    getCurrentTime: async () => 0
  };
};

/**
 * Simple text-to-speech fallback for testing
 */
export const speakText = (text: string): void => {
  if (Platform.OS === 'web' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to use a natural-sounding voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Samantha') || 
      voice.name.includes('Karen') || 
      voice.name.includes('Google') ||
      voice.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthesis.speak(utterance);
  } else {
    console.log('Text-to-speech not available on this platform');
  }
};

/**
 * Stop all speech synthesis
 */
export const stopSpeaking = (): void => {
  if (Platform.OS === 'web' && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
};
