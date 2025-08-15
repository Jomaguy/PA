// Todo filters component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { TodoFilters } from '../types/todo';
import { LIFE_ROLE_CATEGORIES, getLifeRoleById } from '../constants/lifeRoles';

interface TodoFiltersProps {
  filters: TodoFilters;
  onFiltersChange: (filters: TodoFilters) => void;
  categories: string[];
}

const TodoFiltersComponent: React.FC<TodoFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
}) => {
  const priorities = [
    { value: 'high', label: 'High', color: '#ff4757' },
    { value: 'medium', label: 'Medium', color: '#ffa502' },
    { value: 'low', label: 'Low', color: '#2ed573' },
  ];

  const completionFilters = [
    { value: undefined, label: 'All' },
    { value: false, label: 'Pending' },
    { value: true, label: 'Completed' },
  ];

  const updateFilters = (key: keyof TodoFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search</Text>
        <TextInput
          style={styles.searchInput}
          value={filters.search || ''}
          onChangeText={(text) => updateFilters('search', text || undefined)}
          placeholder="Search todos..."
          placeholderTextColor="#747d8c"
        />
      </View>

      {/* Completion Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {completionFilters.map((filter) => (
              <TouchableOpacity
                key={filter.label}
                style={[
                  styles.filterButton,
                  filters.completed === filter.value && styles.activeFilterButton,
                ]}
                onPress={() => updateFilters('completed', filter.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filters.completed === filter.value && styles.activeFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Priority */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !filters.priority && styles.activeFilterButton,
              ]}
              onPress={() => updateFilters('priority', undefined)}
            >
              <Text
                style={[
                  styles.filterText,
                  !filters.priority && styles.activeFilterText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.filterButton,
                  { borderColor: priority.color },
                  filters.priority === priority.value && {
                    backgroundColor: priority.color,
                  },
                ]}
                onPress={() => updateFilters('priority', priority.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filters.priority === priority.value && styles.activeFilterText,
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Life Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Life Roles</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !filters.category && styles.activeFilterButton,
              ]}
              onPress={() => updateFilters('category', undefined)}
            >
              <Text
                style={[
                  styles.filterText,
                  !filters.category && styles.activeFilterText,
                ]}
              >
                All Roles
              </Text>
            </TouchableOpacity>
            {LIFE_ROLE_CATEGORIES.map((role) => {
              const isActive = filters.category === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleFilterButton,
                    { borderColor: role.color },
                    isActive && { backgroundColor: role.color + '20', borderWidth: 2 },
                  ]}
                  onPress={() => updateFilters('category', role.id)}
                >
                  <Text style={styles.roleFilterEmoji}>{role.emoji}</Text>
                  <Text
                    style={[
                      styles.roleFilterText,
                      isActive && { color: role.color, fontWeight: '600' },
                    ]}
                  >
                    {role.label.replace(role.emoji + ' ', '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Legacy Categories (for backward compatibility) */}
      {categories.length > 0 && categories.some(cat => !LIFE_ROLE_CATEGORIES.find(role => role.id === cat)) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {categories.filter(cat => !LIFE_ROLE_CATEGORIES.find(role => role.id === cat)).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterButton,
                    filters.category === category && styles.activeFilterButton,
                  ]}
                  onPress={() => updateFilters('category', category)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filters.category === category && styles.activeFilterText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <View style={styles.clearSection}>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c2c54',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#40407a',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#40407a',
    borderWidth: 1,
    borderColor: '#70a1ff',
  },
  activeFilterButton: {
    backgroundColor: '#70a1ff',
    borderColor: '#70a1ff',
  },
  filterText: {
    color: '#a4b0be',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  roleFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#40407a',
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  roleFilterEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  roleFilterText: {
    color: '#a4b0be',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  clearSection: {
    borderTopWidth: 1,
    borderTopColor: '#40407a',
    paddingTop: 12,
    alignItems: 'center',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ff4757',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TodoFiltersComponent;
