// Add/Edit todo form component
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { CreateTodoInput } from '../types/todo';
import { LIFE_ROLE_CATEGORIES } from '../constants/lifeRoles';

interface AddTodoFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (todo: CreateTodoInput) => void;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ visible, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');

  const lifeRoleCategories = LIFE_ROLE_CATEGORIES;
  const priorities = [
    { value: 'low', label: 'Low', color: '#2ed573' },
    { value: 'medium', label: 'Medium', color: '#ffa502' },
    { value: 'high', label: 'High', color: '#ff4757' },
  ] as const;

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }

    const todoData: CreateTodoInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category: category || undefined,
    };

    onSubmit(todoData);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add New Todo</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!title.trim()}
            style={[styles.submitButton, !title.trim() && styles.disabledButton]}
          >
            <Text style={[styles.submitButtonText, !title.trim() && styles.disabledButtonText]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor="#747d8c"
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add some details..."
              placeholderTextColor="#747d8c"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityButton,
                    { borderColor: p.color },
                    priority === p.value && { backgroundColor: p.color },
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p.value && styles.selectedPriorityText,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Life Role</Text>
            <View style={styles.categoryGrid}>
              {lifeRoleCategories.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleButton,
                    { borderColor: role.color },
                    category === role.id && { backgroundColor: role.color + '20', borderWidth: 2 },
                  ]}
                  onPress={() => setCategory(category === role.id ? '' : role.id)}
                >
                  <Text style={styles.roleEmoji}>{role.emoji}</Text>
                  <Text
                    style={[
                      styles.roleText,
                      category === role.id && { color: role.color, fontWeight: '600' },
                    ]}
                  >
                    {role.label.replace(role.emoji + ' ', '')}
                  </Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, styles.customCategoryInput]}
              value={category}
              onChangeText={setCategory}
              placeholder="Or enter custom role..."
              placeholderTextColor="#747d8c"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#70a1ff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2ed573',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#747d8c',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#a4b0be',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2c2c54',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#40407a',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedPriorityText: {
    color: '#ffffff',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    width: '48%',
    backgroundColor: '#2c2c54',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#40407a',
    minHeight: 80,
  },
  roleEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  roleDescription: {
    color: '#a4b0be',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2c2c54',
    borderWidth: 1,
    borderColor: '#40407a',
  },
  selectedCategoryButton: {
    backgroundColor: '#70a1ff',
    borderColor: '#70a1ff',
  },
  categoryText: {
    color: '#a4b0be',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  customCategoryInput: {
    marginTop: 8,
  },
});

export default AddTodoForm;
