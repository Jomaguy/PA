// Individual todo item component
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Todo } from '../types/todo';
import { getLifeRoleById, getLifeRoleColor, getLifeRoleEmoji } from '../constants/lifeRoles';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return '#747d8c';
    
    // Check if it's a life role category
    const role = getLifeRoleById(category);
    if (role) {
      return role.color;
    }
    
    // Fallback for legacy categories
    const colors = ['#3742fa', '#2f3542', '#ff6348', '#7bed9f', '#70a1ff', '#5352ed'];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getCategoryDisplay = (category?: string) => {
    if (!category) return null;
    
    const role = getLifeRoleById(category);
    if (role) {
      return {
        emoji: role.emoji,
        label: role.label.replace(role.emoji + ' ', ''),
        color: role.color
      };
    }
    
    return {
      emoji: '📝',
      label: category,
      color: getCategoryColor(category)
    };
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Todo title"
            placeholderTextColor="#747d8c"
            autoFocus
          />
          <TextInput
            style={[styles.editInput, styles.descriptionInput]}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Description (optional)"
            placeholderTextColor="#747d8c"
            multiline
          />
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      todo.completed && styles.completedContainer,
      { borderLeftColor: todo.category ? getCategoryColor(todo.category) : '#40407a' }
    ]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.checkbox, todo.completed && styles.checkedBox]}
            onPress={() => onToggleComplete(todo.id)}
          >
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          
          <View style={styles.todoInfo}>
            <Text style={[styles.title, todo.completed && styles.completedTitle]}>
              {todo.title}
            </Text>
            {todo.description && (
              <Text style={[styles.description, todo.completed && styles.completedDescription]}>
                {todo.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.metadata}>
          <View style={styles.tags}>
            <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(todo.priority) }]}>
              <Text style={styles.tagText}>{todo.priority}</Text>
            </View>
            {todo.category && (
              <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(todo.category) }]}>
                {getCategoryDisplay(todo.category) && (
                  <>
                    <Text style={styles.categoryEmoji}>{getCategoryDisplay(todo.category)!.emoji}</Text>
                    <Text style={styles.tagText}>{getCategoryDisplay(todo.category)!.label}</Text>
                  </>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            Created: {new Date(todo.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c2c54',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#40407a',
  },
  completedContainer: {
    opacity: 0.7,
    borderLeftColor: '#2ed573',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#747d8c',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#2ed573',
    borderColor: '#2ed573',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoInfo: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#a4b0be',
  },
  description: {
    color: '#a4b0be',
    fontSize: 14,
    lineHeight: 20,
  },
  completedDescription: {
    color: '#747d8c',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    color: '#70a1ff',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteText: {
    color: '#ff4757',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#40407a',
    paddingTop: 8,
  },
  timestamp: {
    color: '#747d8c',
    fontSize: 12,
  },
  editContainer: {
    backgroundColor: '#40407a',
    borderRadius: 8,
    padding: 16,
  },
  editInput: {
    backgroundColor: '#2c2c54',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#2ed573',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#747d8c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default TodoItem;
