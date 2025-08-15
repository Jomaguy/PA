// Life role categories for enhanced todo organization
import { LifeRoleCategory } from '../types/todo';

export const LIFE_ROLE_CATEGORIES: LifeRoleCategory[] = [
  {
    id: 'tennis_coach',
    label: '🎾 Tennis Coach',
    emoji: '🎾',
    color: '#ff6b6b',
    description: 'Coaching activities, lessons, player development'
  },
  {
    id: 'relationship',
    label: '💕 Relationship',
    emoji: '💕',
    color: '#ff8cc8',
    description: 'Date planning, couple activities, relationship goals'
  },
  {
    id: 'family',
    label: '👨‍👩‍👧‍👦 Family',
    emoji: '👨‍👩‍👧‍👦',
    color: '#74b9ff',
    description: 'Family time, calls, events, son/brother responsibilities'
  },
  {
    id: 'miss_money_penny',
    label: '💰 Miss Money Penny',
    emoji: '💰',
    color: '#00b894',
    description: 'Project development, meetings, strategic planning'
  },
  {
    id: 'branch',
    label: '🌿 Branch',
    emoji: '🌿',
    color: '#55a3ff',
    description: 'Project milestones, team coordination, deliverables'
  },
  {
    id: 'finance',
    label: '💸 Finance',
    emoji: '💸',
    color: '#fdcb6e',
    description: 'Budget tracking, investments, financial planning'
  },
  {
    id: 'health',
    label: '🏥 Health',
    emoji: '🏥',
    color: '#e17055',
    description: 'Medical appointments, fitness, mental health, nutrition'
  },
  {
    id: 'personal_dev',
    label: '📚 Personal Development',
    emoji: '📚',
    color: '#a29bfe',
    description: 'Learning, skills, hobbies, self-improvement'
  },
  {
    id: 'other',
    label: '📝 Other',
    emoji: '📝',
    color: '#636e72',
    description: 'Miscellaneous tasks and activities'
  }
];

// Helper functions for working with life roles
export const getLifeRoleById = (id: string): LifeRoleCategory | undefined => {
  return LIFE_ROLE_CATEGORIES.find(role => role.id === id);
};

export const getLifeRoleColor = (id: string): string => {
  const role = getLifeRoleById(id);
  return role?.color || '#636e72';
};

export const getLifeRoleEmoji = (id: string): string => {
  const role = getLifeRoleById(id);
  return role?.emoji || '📝';
};

export const getLifeRoleLabel = (id: string): string => {
  const role = getLifeRoleById(id);
  return role?.label || 'Other';
};
