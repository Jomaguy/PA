// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { Todo } from '../types/todo';

// Database schema interface
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: Todo;
        Insert: Omit<Todo, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// Supabase configuration - using multiple sources for environment variables
// Debug environment variable loading
console.log('🔍 Supabase Environment Debug:');
console.log('Constants.expoConfig?.extra?.SUPABASE_URL:', Constants.expoConfig?.extra?.SUPABASE_URL ? 'Found' : 'Missing');
console.log('Constants.expoConfig?.extra?.SUPABASE_ANON_KEY:', Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ? 'Found' : 'Missing');
console.log('process.env.SUPABASE_URL:', process.env.SUPABASE_URL ? 'Found' : 'Missing');
console.log('process.env.SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Found' : 'Missing');

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   process.env.SUPABASE_URL || 
                   'https://your-project.supabase.co';

const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || 
                       process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       process.env.SUPABASE_ANON_KEY || 
                       'your-anon-key';

// Log final resolved values for debugging
console.log('🔑 Final Supabase Config:');
console.log('URL:', supabaseUrl.substring(0, 30) + '...');
console.log('Key Status:', supabaseAnonKey !== 'your-anon-key' ? 'Loaded' : 'Using default (check .env file)');

// Alert if using default values
if (supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.error('⚠️  WARNING: Using default Supabase configuration!');
  console.error('Please check your .env file and make sure it contains:');
  console.error('SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_ANON_KEY=your_supabase_anon_key');
}

// Create Supabase client with TypeScript types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // For demo purposes, we'll use anonymous auth
    // In production, implement proper authentication
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    // Enable real-time subscriptions
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connection function
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testing Supabase connection...');
    console.log('📍 Supabase URL:', supabaseUrl.substring(0, 30) + '...');
    console.log('🔑 API Key:', supabaseAnonKey ? '✅ Loaded' : '❌ Missing');
    
    const { data, error } = await supabase.from('todos').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('💡 Possible issues:');
      console.error('   - Check your .env file has correct SUPABASE_URL and SUPABASE_ANON_KEY');
      console.error('   - Verify the todos table exists in Supabase');
      console.error('   - Check RLS policies allow access');
      return false;
    }
    console.log('✅ Supabase connection successful! Ready to save todos.');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};
