// Custom hook for todo state management
import { useState, useEffect, useCallback } from 'react';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters, TodoStats } from '../types/todo';
import {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  getTodoStats,
  syncPendingOperations,
} from '../services/todoService';
import { supabase } from '../services/supabaseClient';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    overdue: 0,
    categoryCounts: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TodoFilters>({});

  // Load todos
  const loadTodos = useCallback(async (appliedFilters?: TodoFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedTodos = await getAllTodos(appliedFilters || filters);
      setTodos(fetchedTodos);
      
      // Update stats
      const todoStats = await getTodoStats();
      setStats(todoStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create new todo
  const addTodo = async (input: CreateTodoInput): Promise<boolean> => {
    try {
      setError(null);
      const newTodo = await createTodo(input);
      
      if (newTodo) {
        // Optimistically update the list
        setTodos(prevTodos => [newTodo, ...prevTodos]);
        
        // Update stats
        const todoStats = await getTodoStats();
        setStats(todoStats);
        
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      console.error('Error creating todo:', err);
      return false;
    }
  };

  // Update existing todo
  const updateExistingTodo = async (id: string, input: UpdateTodoInput): Promise<boolean> => {
    try {
      setError(null);
      const updatedTodo = await updateTodo(id, input);
      
      if (updatedTodo) {
        // Optimistically update the list
        setTodos(prevTodos =>
          prevTodos.map(todo => (todo.id === id ? updatedTodo : todo))
        );
        
        // Update stats
        const todoStats = await getTodoStats();
        setStats(todoStats);
        
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      console.error('Error updating todo:', err);
      return false;
    }
  };

  // Delete todo
  const removeTodo = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await deleteTodo(id);
      
      if (success) {
        // Optimistically update the list
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        
        // Update stats
        const todoStats = await getTodoStats();
        setStats(todoStats);
        
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      console.error('Error deleting todo:', err);
      return false;
    }
  };

  // Toggle completion status
  const toggleComplete = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const updatedTodo = await toggleTodoComplete(id);
      
      if (updatedTodo) {
        // Optimistically update the list
        setTodos(prevTodos =>
          prevTodos.map(todo => (todo.id === id ? updatedTodo : todo))
        );
        
        // Update stats
        const todoStats = await getTodoStats();
        setStats(todoStats);
        
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle todo');
      console.error('Error toggling todo:', err);
      return false;
    }
  };

  // Apply filters
  const applyFilters = useCallback((newFilters: TodoFilters) => {
    setFilters(newFilters);
    loadTodos(newFilters);
  }, [loadTodos]);

  // Sync pending operations
  const sync = async () => {
    try {
      await syncPendingOperations();
      await loadTodos();
    } catch (err) {
      console.error('Error syncing:', err);
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      const subscription = supabase
        .channel('todos_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'todos',
          },
          (payload) => {
            console.log('Real-time update:', payload);
            // Reload todos when changes occur
            loadTodos();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    const unsubscribe = setupRealtimeSubscription();
    return unsubscribe;
  }, [loadTodos]);

  // Initial load and periodic sync
  useEffect(() => {
    loadTodos();
    
    // Sync pending operations on app start
    sync();
    
    // Setup periodic sync (every 30 seconds)
    const syncInterval = setInterval(sync, 30000);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [loadTodos]);

  // Get unique categories for filtering
  const categories = Array.from(
    new Set(todos.map(todo => todo.category).filter(Boolean))
  ) as string[];

  return {
    todos,
    stats,
    loading,
    error,
    filters,
    categories,
    actions: {
      loadTodos,
      addTodo,
      updateTodo: updateExistingTodo,
      removeTodo,
      toggleComplete,
      applyFilters,
      sync,
    },
  };
};
