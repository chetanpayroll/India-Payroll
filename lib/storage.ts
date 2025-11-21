/**
 * UAE Payroll System - Local Storage Data Persistence Layer
 * Provides IndexedDB-like interface with localStorage fallback
 */

const STORAGE_PREFIX = 'uae_payroll_';
const STORAGE_VERSION = '1.0';

// Storage keys
export const StorageKeys = {
  EMPLOYEES: `${STORAGE_PREFIX}employees`,
  PAYROLL_RUNS: `${STORAGE_PREFIX}payroll_runs`,
  PAYROLL_ITEMS: `${STORAGE_PREFIX}payroll_items`,
  LEAVE_REQUESTS: `${STORAGE_PREFIX}leave_requests`,
  LEAVE_BALANCES: `${STORAGE_PREFIX}leave_balances`,
  LOANS: `${STORAGE_PREFIX}loans`,
  SALARY_ADVANCES: `${STORAGE_PREFIX}salary_advances`,
  PAYSLIPS: `${STORAGE_PREFIX}payslips`,
  WPS_FILES: `${STORAGE_PREFIX}wps_files`,
  COMPANY_SETTINGS: `${STORAGE_PREFIX}company_settings`,
  PUBLIC_HOLIDAYS: `${STORAGE_PREFIX}public_holidays`,
  VERSION: `${STORAGE_PREFIX}version`,
} as const;

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Generic storage service for type-safe localStorage operations
 */
class StorageService {
  /**
   * Save data to localStorage
   */
  set<T>(key: string, data: T): void {
    if (!isBrowser) return;
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      throw new Error('Failed to save data');
    }
  }

  /**
   * Get data from localStorage
   */
  get<T>(key: string, defaultValue: T): T {
    if (!isBrowser) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): void {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  /**
   * Clear all app data from localStorage
   */
  clearAll(): void {
    if (!isBrowser) return;
    try {
      Object.values(StorageKeys).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    if (!isBrowser) return false;
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    if (!isBrowser) return 0;
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith(STORAGE_PREFIX)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * Export all data for backup
   */
  exportData(): Record<string, any> {
    if (!isBrowser) return {};
    const data: Record<string, any> = {};
    Object.entries(StorageKeys).forEach(([name, key]) => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          data[name] = JSON.parse(item);
        } catch {
          data[name] = item;
        }
      }
    });
    return data;
  }

  /**
   * Import data from backup
   */
  importData(data: Record<string, any>): void {
    if (!isBrowser) return;
    try {
      Object.entries(data).forEach(([name, value]) => {
        const key = StorageKeys[name as keyof typeof StorageKeys];
        if (key) {
          this.set(key, value);
        }
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }

  /**
   * Initialize storage with version check
   */
  initialize(): void {
    if (!isBrowser) return;
    const currentVersion = this.get<string>(StorageKeys.VERSION, '');
    if (currentVersion !== STORAGE_VERSION) {
      console.log('Storage version mismatch, initializing...');
      this.set(StorageKeys.VERSION, STORAGE_VERSION);
    }
  }
}

/**
 * Generic collection manager for CRUD operations
 */
export class Collection<T extends { id: string }> {
  constructor(private storageKey: string, private storage: StorageService) {}

  /**
   * Get all items
   */
  getAll(): T[] {
    return this.storage.get<T[]>(this.storageKey, []);
  }

  /**
   * Get item by ID
   */
  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find((item) => item.id === id);
  }

  /**
   * Get items by filter function
   */
  filter(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  /**
   * Find single item by filter function
   */
  find(predicate: (item: T) => boolean): T | undefined {
    return this.getAll().find(predicate);
  }

  /**
   * Add new item
   */
  add(item: T): T {
    const items = this.getAll();

    // Check for duplicate ID
    if (items.some((existing) => existing.id === item.id)) {
      throw new Error(`Item with ID ${item.id} already exists`);
    }

    items.push(item);
    this.storage.set(this.storageKey, items);
    return item;
  }

  /**
   * Add multiple items
   */
  addMany(newItems: T[]): T[] {
    const items = this.getAll();
    items.push(...newItems);
    this.storage.set(this.storageKey, items);
    return newItems;
  }

  /**
   * Update existing item
   */
  update(id: string, updates: Partial<T>): T {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`Item with ID ${id} not found`);
    }

    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;
    this.storage.set(this.storageKey, items);
    return updatedItem;
  }

  /**
   * Delete item by ID
   */
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);

    if (filtered.length === items.length) {
      return false; // Item not found
    }

    this.storage.set(this.storageKey, filtered);
    return true;
  }

  /**
   * Delete multiple items by IDs
   */
  deleteMany(ids: string[]): number {
    const items = this.getAll();
    const idsSet = new Set(ids);
    const filtered = items.filter((item) => !idsSet.has(item.id));
    const deletedCount = items.length - filtered.length;

    this.storage.set(this.storageKey, filtered);
    return deletedCount;
  }

  /**
   * Count items
   */
  count(): number {
    return this.getAll().length;
  }

  /**
   * Check if item exists
   */
  exists(id: string): boolean {
    return this.getAll().some((item) => item.id === id);
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.storage.set(this.storageKey, []);
  }

  /**
   * Replace all items
   */
  replaceAll(items: T[]): void {
    this.storage.set(this.storageKey, items);
  }

  /**
   * Get paginated results
   */
  paginate(page: number = 1, pageSize: number = 10): {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const allItems = this.getAll();
    const total = allItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = allItems.slice(start, end);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Sort items
   */
  sort(compareFn: (a: T, b: T) => number): T[] {
    return this.getAll().sort(compareFn);
  }
}

// Create singleton instance
export const storage = new StorageService();

// Initialize storage on module load
if (typeof window !== 'undefined') {
  storage.initialize();
}

/**
 * Download data as JSON file
 */
export function downloadAsJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Upload JSON file and parse
 */
export function uploadJSON(): Promise<any> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}
