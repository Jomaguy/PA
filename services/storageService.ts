// Local storage service for offline todo caching
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

const TODOS_CACHE_KEY = 'todos_cache';
const PENDING_SYNC_KEY = 'pending_sync_operations';

export interface PendingSyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: Partial<Todo>;
  timestamp: number;
}

/**
 * Cache todos locally for offline access
 */
export const cacheTodos = async (todos: Todo[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(todos));
    console.log('✅ Todos cached locally');
  } catch (error) {
    console.error('❌ Failed to cache todos:', error);
  }
};

/**
 * Get cached todos from local storage
 */
export const getCachedTodos = async (): Promise<Todo[]> => {
  try {
    const cachedData = await AsyncStorage.getItem(TODOS_CACHE_KEY);
    if (cachedData) {
      const todos = JSON.parse(cachedData) as Todo[];
      console.log(`📱 Retrieved ${todos.length} cached todos`);
      return todos;
    }
    return [];
  } catch (error) {
    console.error('❌ Failed to get cached todos:', error);
    return [];
  }
};

/**
 * Add a pending sync operation for offline actions
 */
export const addPendingSyncOperation = async (operation: Omit<PendingSyncOperation, 'timestamp'>): Promise<void> => {
  try {
    const existingOps = await getPendingSyncOperations();
    const newOperation: PendingSyncOperation = {
      ...operation,
      timestamp: Date.now(),
    };
    
    existingOps.push(newOperation);
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(existingOps));
    console.log('📤 Added pending sync operation:', operation.type);
  } catch (error) {
    console.error('❌ Failed to add pending sync operation:', error);
  }
};

/**
 * Get all pending sync operations
 */
export const getPendingSyncOperations = async (): Promise<PendingSyncOperation[]> => {
  try {
    const pendingData = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    if (pendingData) {
      return JSON.parse(pendingData) as PendingSyncOperation[];
    }
    return [];
  } catch (error) {
    console.error('❌ Failed to get pending sync operations:', error);
    return [];
  }
};

/**
 * Clear pending sync operations after successful sync
 */
export const clearPendingSyncOperations = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PENDING_SYNC_KEY);
    console.log('✅ Cleared pending sync operations');
  } catch (error) {
    console.error('❌ Failed to clear pending sync operations:', error);
  }
};

/**
 * Clear all cached data
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TODOS_CACHE_KEY, PENDING_SYNC_KEY]);
    console.log('✅ Cleared all cached data');
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
  }
};
