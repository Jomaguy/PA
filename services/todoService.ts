// Todo service with Supabase integration and offline support
import { supabase, testSupabaseConnection } from './supabaseClient';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters, TodoStats } from '../types/todo';
import { 
  cacheTodos, 
  getCachedTodos, 
  addPendingSyncOperation, 
  getPendingSyncOperations, 
  clearPendingSyncOperations 
} from './storageService';

/**
 * Get all todos with optional filtering and sorting
 */
export const getAllTodos = async (filters?: TodoFilters): Promise<Todo[]> => {
  try {
    console.log('📋 Fetching all todos...');
    
    // Try to fetch from Supabase first
    let query = supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching todos from Supabase:', error);
      // Fallback to cached data
      const cachedTodos = await getCachedTodos();
      return applyLocalFilters(cachedTodos, filters);
    }

    if (data) {
      // Cache the fetched data
      await cacheTodos(data);
      const filteredData = applyLocalFilters(data, filters);
      console.log(`✅ Retrieved ${filteredData.length} todos from Supabase`);
      return filteredData;
    }

    return [];
  } catch (error) {
    console.error('❌ Error in getAllTodos:', error);
    // Return cached data as fallback
    const cachedTodos = await getCachedTodos();
    return applyLocalFilters(cachedTodos, filters);
  }
};

/**
 * Create a new todo
 */
export const createTodo = async (input: CreateTodoInput): Promise<Todo | null> => {
  try {
    console.log('➕ Creating new todo:', input.title);

    const todoData = {
      ...input,
      completed: false,
      priority: input.priority || 'medium',
    };

    const { data, error } = await supabase
      .from('todos')
      .insert([todoData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating todo:', error);
      
      // Add to pending sync for offline support
      const tempId = `temp_${Date.now()}`;
      const tempTodo: Todo = {
        id: tempId,
        ...todoData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await addPendingSyncOperation({
        id: tempId,
        type: 'create',
        data: todoData,
      });

      // Update local cache optimistically
      const cachedTodos = await getCachedTodos();
      cachedTodos.unshift(tempTodo);
      await cacheTodos(cachedTodos);
      
      return tempTodo;
    }

    if (data) {
      // Update local cache
      const cachedTodos = await getCachedTodos();
      cachedTodos.unshift(data);
      await cacheTodos(cachedTodos);
      
      console.log('✅ Todo created successfully');
      return data;
    }

    return null;
  } catch (error) {
    console.error('❌ Error in createTodo:', error);
    return null;
  }
};

/**
 * Update an existing todo
 */
export const updateTodo = async (id: string, input: UpdateTodoInput): Promise<Todo | null> => {
  try {
    console.log('📝 Updating todo:', id);

    const updateData = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating todo:', error);
      
      // Add to pending sync for offline support
      await addPendingSyncOperation({
        id,
        type: 'update',
        data: updateData,
      });

      // Update local cache optimistically
      const cachedTodos = await getCachedTodos();
      const todoIndex = cachedTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        cachedTodos[todoIndex] = { ...cachedTodos[todoIndex], ...updateData };
        await cacheTodos(cachedTodos);
        return cachedTodos[todoIndex];
      }
      
      return null;
    }

    if (data) {
      // Update local cache
      const cachedTodos = await getCachedTodos();
      const todoIndex = cachedTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        cachedTodos[todoIndex] = data;
        await cacheTodos(cachedTodos);
      }
      
      console.log('✅ Todo updated successfully');
      return data;
    }

    return null;
  } catch (error) {
    console.error('❌ Error in updateTodo:', error);
    return null;
  }
};

/**
 * Delete a todo
 */
export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting todo:', id);

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting todo:', error);
      
      // Add to pending sync for offline support
      await addPendingSyncOperation({
        id,
        type: 'delete',
      });

      // Remove from local cache optimistically
      const cachedTodos = await getCachedTodos();
      const filteredTodos = cachedTodos.filter(todo => todo.id !== id);
      await cacheTodos(filteredTodos);
      
      return true; // Return true for optimistic update
    }

    // Remove from local cache
    const cachedTodos = await getCachedTodos();
    const filteredTodos = cachedTodos.filter(todo => todo.id !== id);
    await cacheTodos(filteredTodos);
    
    console.log('✅ Todo deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in deleteTodo:', error);
    return false;
  }
};

/**
 * Toggle todo completion status
 */
export const toggleTodoComplete = async (id: string): Promise<Todo | null> => {
  try {
    // First get the current todo to toggle its status
    const cachedTodos = await getCachedTodos();
    const currentTodo = cachedTodos.find(todo => todo.id === id);
    
    if (!currentTodo) {
      console.error('❌ Todo not found for toggle:', id);
      return null;
    }

    return await updateTodo(id, { completed: !currentTodo.completed });
  } catch (error) {
    console.error('❌ Error in toggleTodoComplete:', error);
    return null;
  }
};

/**
 * Get todos by category
 */
export const getTodosByCategory = async (category: string): Promise<Todo[]> => {
  return await getAllTodos({ category });
};

/**
 * Get todos by priority
 */
export const getTodosByPriority = async (priority: string): Promise<Todo[]> => {
  return await getAllTodos({ priority });
};

/**
 * Get todo statistics
 */
export const getTodoStats = async (): Promise<TodoStats> => {
  try {
    const todos = await getAllTodos();
    
    const stats: TodoStats = {
      total: todos.length,
      completed: todos.filter(todo => todo.completed).length,
      pending: todos.filter(todo => !todo.completed).length,
      highPriority: todos.filter(todo => todo.priority === 'high' && !todo.completed).length,
      overdue: 0, // Will implement due date logic later
      categoryCounts: {},
    };

    // Calculate category counts
    todos.forEach(todo => {
      const category = todo.category || 'Uncategorized';
      stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('❌ Error getting todo stats:', error);
    return {
      total: 0,
      completed: 0,
      pending: 0,
      highPriority: 0,
      overdue: 0,
      categoryCounts: {},
    };
  }
};

/**
 * Sync pending operations when connection is restored
 */
export const syncPendingOperations = async (): Promise<void> => {
  try {
    console.log('🔄 Syncing pending operations...');
    
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      console.log('❌ No connection, skipping sync');
      return;
    }

    const pendingOps = await getPendingSyncOperations();
    if (pendingOps.length === 0) {
      console.log('✅ No pending operations to sync');
      return;
    }

    for (const op of pendingOps) {
      try {
        switch (op.type) {
          case 'create':
            if (op.data) {
              await supabase.from('todos').insert([op.data]);
            }
            break;
          case 'update':
            if (op.data) {
              await supabase.from('todos').update(op.data).eq('id', op.id);
            }
            break;
          case 'delete':
            await supabase.from('todos').delete().eq('id', op.id);
            break;
        }
        console.log(`✅ Synced ${op.type} operation for todo ${op.id}`);
      } catch (error) {
        console.error(`❌ Failed to sync ${op.type} operation:`, error);
      }
    }

    await clearPendingSyncOperations();
    console.log('✅ Sync completed');
  } catch (error) {
    console.error('❌ Error syncing pending operations:', error);
  }
};

/**
 * Apply local filters to todos (for offline use)
 */
const applyLocalFilters = (todos: Todo[], filters?: TodoFilters): Todo[] => {
  if (!filters) return todos;

  return todos.filter(todo => {
    if (filters.category && todo.category !== filters.category) return false;
    if (filters.priority && todo.priority !== filters.priority) return false;
    if (filters.completed !== undefined && todo.completed !== filters.completed) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = todo.title.toLowerCase().includes(searchLower);
      const descriptionMatch = todo.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descriptionMatch) return false;
    }
    return true;
  });
};
