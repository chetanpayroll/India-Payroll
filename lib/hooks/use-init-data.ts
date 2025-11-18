/**
 * Hook to initialize sample data on first load
 */

import { useEffect } from 'react';
import { storage, StorageKeys } from '../storage';
import { initializeSampleData } from '../services/sample-data';

export function useInitData() {
  useEffect(() => {
    // Check if this is the first time loading the app
    const isInitialized = storage.get(StorageKeys.VERSION, '');

    if (!isInitialized) {
      console.log('First time loading - initializing sample data...');
      initializeSampleData();
    }
  }, []);
}
