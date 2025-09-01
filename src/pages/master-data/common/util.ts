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

// LocalStorage helpers with improved error handling and fallbacks
export function loadFromStorage<T>(key: string): T[] {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !window.localStorage) {
      console.warn('localStorage is not available, using empty array as fallback');
      return [];
    }

    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);
    
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn(`Data in localStorage key "${key}" is not an array, returning empty array`);
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(`Failed to load data from localStorage key "${key}":`, error);
    
    // Try to clear corrupted data
    try {
      localStorage.removeItem(key);
      console.log(`Cleared corrupted data from localStorage key "${key}"`);
    } catch (clearError) {
      console.error(`Failed to clear corrupted data from localStorage key "${key}":`, clearError);
    }
    
    return [];
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !window.localStorage) {
      console.warn('localStorage is not available, data will not be persisted');
      return;
    }

    // Validate input data
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    const jsonString = JSON.stringify(data);
    
    // Check for quota exceeded
    const currentSize = JSON.stringify(localStorage).length;
    const dataSize = jsonString.length;
    
    // Rough estimate of available space (most browsers have 5-10MB limit)
    if (currentSize + dataSize > 4 * 1024 * 1024) { // 4MB threshold
      console.warn('localStorage may be approaching quota limit');
    }

    localStorage.setItem(key, jsonString);
  } catch (error) {
    console.error(`Failed to save data to localStorage key "${key}":`, error);
    
    // Handle specific error types
    if (error instanceof DOMException) {
      if (error.code === 22 || error.name === 'QuotaExceededError') {
        // localStorage quota exceeded
        console.error('localStorage quota exceeded. Consider clearing old data.');
        throw new Error('Storage space is full. Please try clearing some data and try again.');
      }
    }
    
    throw new Error('Failed to save data. Please try again.');
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