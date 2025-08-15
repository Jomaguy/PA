// TypeScript interfaces for Todo functionality

export interface LifeRoleCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string; // This will now store the category ID
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date?: string;
}

export interface TodoFilters {
  category?: string;
  priority?: string;
  completed?: boolean;
  search?: string;
}

export interface EnhancedTodoFilters extends TodoFilters {
  lifeRole?: string;
  dateRange?: 'today' | 'week' | 'month' | 'overdue';
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  overdue: number;
  categoryCounts: Record<string, number>;
}
