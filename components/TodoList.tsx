// Main todo list component
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTodos } from '../hooks/useTodos';
import TodoItem from './TodoItem';
import AddTodoForm from './AddTodoForm';
import TodoFiltersComponent from './TodoFilters';
import TodoStatsComponent from './TodoStats';
import RoleDashboard from './RoleDashboard';

const TodoList: React.FC = () => {
  const {
    todos,
    stats,
    loading,
    error,
    filters,
    categories,
    actions,
  } = useTodos();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showRoleDashboard, setShowRoleDashboard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await actions.sync();
    await actions.loadTodos();
    setRefreshing(false);
  };

  const handleAddTodo = async (todoData: any) => {
    const success = await actions.addTodo(todoData);
    if (success) {
      setShowAddForm(false);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    actions.applyFilters({ category: roleId });
    setShowRoleDashboard(false);
  };

  const renderTodoItem = ({ item }: { item: any }) => (
    <TodoItem
      todo={item}
      onToggleComplete={actions.toggleComplete}
      onUpdate={actions.updateTodo}
      onDelete={actions.removeTodo}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Stats */}
      <TodoStatsComponent stats={stats} />

      {/* Role Dashboard */}
      {showRoleDashboard && (
        <RoleDashboard
          stats={stats}
          onRoleSelect={handleRoleSelect}
          selectedRole={filters.category}
        />
      )}

      {/* Control Buttons */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.controlButton, showRoleDashboard && styles.activeControlButton]}
          onPress={() => setShowRoleDashboard(!showRoleDashboard)}
        >
          <Text style={[styles.controlButtonText, showRoleDashboard && styles.activeControlButtonText]}>
            {showRoleDashboard ? 'Hide Roles' : 'Life Roles'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, showFilters && styles.activeControlButton]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={[styles.controlButtonText, showFilters && styles.activeControlButtonText]}>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Text>
        </TouchableOpacity>

        <View style={styles.todosCount}>
          <Text style={styles.todosCountText}>
            {todos.length} {todos.length === 1 ? 'todo' : 'todos'}
          </Text>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <TodoFiltersComponent
          filters={filters}
          onFiltersChange={actions.applyFilters}
          categories={categories}
        />
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={actions.loadTodos}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No todos yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        {Object.values(filters).some(v => v !== undefined && v !== '')
          ? 'No todos match your current filters'
          : 'Tap the + button to create your first todo'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (loading && todos.length > 0) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator color="#70a1ff" />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Todos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Todo List */}
      {loading && todos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#70a1ff" />
          <Text style={styles.loadingText}>Loading your todos...</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#70a1ff"
              colors={['#70a1ff']}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Todo Form */}
      <AddTodoForm
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddTodo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c54',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#70a1ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2c2c54',
    borderWidth: 1,
    borderColor: '#40407a',
  },
  activeControlButton: {
    backgroundColor: '#70a1ff',
    borderColor: '#70a1ff',
  },
  controlButtonText: {
    color: '#a4b0be',
    fontSize: 14,
    fontWeight: '500',
  },
  activeControlButtonText: {
    color: '#ffffff',
  },
  todosCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2c2c54',
    borderRadius: 12,
  },
  todosCountText: {
    color: '#a4b0be',
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: '#ff4757',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  retryButtonText: {
    color: '#ff4757',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#a4b0be',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a4b0be',
    fontSize: 16,
    marginTop: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default TodoList;
