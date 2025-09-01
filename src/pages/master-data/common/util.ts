// Utility functions for master data

// Generate unique ID with timestamp
export function generateId(prefix: string = 'ms'): string {
  return `${prefix}_${Date.now()}`;
}

// Get current timestamp as ISO string
export function nowISO(): string {
  return new Date().toISOString();
}

// Format date using date-fns
import { format } from 'date-fns';

export function formatDate(dateStr: string, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    return format(new Date(dateStr), formatStr);
  } catch {
    return dateStr;
  }
}

// LocalStorage helpers
export function loadFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Check if seeding has been done
export function hasBeenSeeded(): boolean {
  return localStorage.getItem('erp.master.seeded') === 'true';
}

// Mark as seeded
export function markAsSeeded(): void {
  localStorage.setItem('erp.master.seeded', 'true');
}

// Text search helper
export function searchInText(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

// Pagination helper
export function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number } {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    data: items.slice(startIndex, endIndex),
    total: items.length
  };
}