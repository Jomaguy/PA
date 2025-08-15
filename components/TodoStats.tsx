// Todo statistics component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { TodoStats } from '../types/todo';

interface TodoStatsProps {
  stats: TodoStats;
}

const TodoStatsComponent: React.FC<TodoStatsProps> = ({ stats }) => {
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, styles.highPriorityNumber]}>
            {stats.highPriority}
          </Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Completion</Text>
          <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${completionPercentage}%` }
            ]} 
          />
        </View>
      </View>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryCounts).length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <View style={styles.categoriesList}>
            {Object.entries(stats.categoryCounts).map(([category, count]) => (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryCount}>{count}</Text>
              </View>
            ))}
          </View>
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
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#70a1ff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  highPriorityNumber: {
    color: '#ff4757',
  },
  statLabel: {
    color: '#a4b0be',
    fontSize: 12,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#70a1ff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#40407a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ed573',
    borderRadius: 4,
  },
  categoriesSection: {
    borderTopWidth: 1,
    borderTopColor: '#40407a',
    paddingTop: 16,
  },
  categoriesTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryName: {
    color: '#a4b0be',
    fontSize: 14,
  },
  categoryCount: {
    color: '#70a1ff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TodoStatsComponent;
