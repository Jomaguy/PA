// Role-based dashboard component for life role statistics
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TodoStats } from '../types/todo';
import { LIFE_ROLE_CATEGORIES, getLifeRoleById } from '../constants/lifeRoles';

interface RoleDashboardProps {
  stats: TodoStats;
  onRoleSelect: (roleId: string) => void;
  selectedRole?: string;
}

const RoleDashboard: React.FC<RoleDashboardProps> = ({
  stats,
  onRoleSelect,
  selectedRole,
}) => {
  const getRoleStats = (roleId: string) => {
    const count = stats.categoryCounts[roleId] || 0;
    return count;
  };

  const getTotalTasks = () => {
    return LIFE_ROLE_CATEGORIES.reduce((total, role) => {
      return total + getRoleStats(role.id);
    }, 0);
  };

  const getRoleProgress = (roleId: string) => {
    const total = getRoleStats(roleId);
    if (total === 0) return 0;
    // This is a simplified calculation - in a real app you'd track completed vs total
    return Math.floor(Math.random() * 100); // Placeholder
  };

  const getBalanceScore = () => {
    const roleCounts = LIFE_ROLE_CATEGORIES.map(role => getRoleStats(role.id));
    const max = Math.max(...roleCounts);
    const min = Math.min(...roleCounts);
    if (max === 0) return 100;
    return Math.floor((1 - (max - min) / max) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Life Role Dashboard</Text>
        <View style={styles.balanceIndicator}>
          <Text style={styles.balanceLabel}>Balance Score</Text>
          <Text style={[styles.balanceScore, { color: getBalanceScore() > 70 ? '#2ed573' : getBalanceScore() > 40 ? '#ffa502' : '#ff4757' }]}>
            {getBalanceScore()}%
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rolesContainer}>
        <View style={styles.rolesRow}>
          {LIFE_ROLE_CATEGORIES.map((role) => {
            const taskCount = getRoleStats(role.id);
            const progress = getRoleProgress(role.id);
            const isSelected = selectedRole === role.id;

            return (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  { borderColor: role.color },
                  isSelected && { backgroundColor: role.color + '10', borderWidth: 2 },
                ]}
                onPress={() => onRoleSelect(role.id)}
              >
                <View style={styles.roleHeader}>
                  <Text style={styles.roleEmoji}>{role.emoji}</Text>
                  <View style={[styles.taskCountBadge, { backgroundColor: role.color }]}>
                    <Text style={styles.taskCountText}>{taskCount}</Text>
                  </View>
                </View>
                
                <Text style={[styles.roleName, isSelected && { color: role.color, fontWeight: '600' }]}>
                  {role.label.replace(role.emoji + ' ', '')}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: role.color + '20' }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          backgroundColor: role.color,
                          width: `${progress}%`
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>
                
                <Text style={styles.roleDescription} numberOfLines={2}>
                  {role.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getTotalTasks()}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{LIFE_ROLE_CATEGORIES.filter(role => getRoleStats(role.id) > 0).length}</Text>
          <Text style={styles.statLabel}>Active Roles</Text>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  balanceIndicator: {
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#a4b0be',
    fontSize: 12,
    marginBottom: 2,
  },
  balanceScore: {
    fontSize: 16,
    fontWeight: '600',
  },
  rolesContainer: {
    marginBottom: 16,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    backgroundColor: '#40407a',
    borderRadius: 12,
    padding: 12,
    width: 140,
    borderWidth: 1,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleEmoji: {
    fontSize: 24,
  },
  taskCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  taskCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  roleName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    color: '#a4b0be',
    fontSize: 10,
    textAlign: 'right',
  },
  roleDescription: {
    color: '#a4b0be',
    fontSize: 10,
    lineHeight: 12,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#40407a',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    color: '#a4b0be',
    fontSize: 12,
    marginTop: 2,
  },
});

export default RoleDashboard;
