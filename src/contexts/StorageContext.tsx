import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '../constants/categories';
import { CategoryName, DailyRecord, DomainStats, ProductivityType, Settings, StorageState } from '../types';
import {
  exportDataJSON,
  getStorageData,
  importDataJSON,
  resetAllData,
  saveStorageData,
} from '../utils/storage';

interface StorageContextType {
  domains: { [domain: string]: DomainStats };
  daily: { [dateStr: string]: DailyRecord };
  settings: Settings;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  updateWebsiteCategory: (domain: string, category: CategoryName) => Promise<void>;
  updateWebsiteProductivity: (domain: string, type: ProductivityType) => Promise<void>;
  resetData: () => Promise<void>;
  exportJSON: () => Promise<string>;
  importJSON: (jsonStr: string) => Promise<boolean>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StorageState>({
    domains: {},
    daily: {},
    settings: DEFAULT_SETTINGS,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = async () => {
    setIsLoading(true);
    const fresh = await getStorageData();
    setData(fresh);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();

    // Listen to chrome storage changes
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.website_time_tracker_data) {
          refreshData();
        }
      };
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...data.settings, ...newSettings };
    await saveStorageData({ settings: updatedSettings });
    await refreshData();
  };

  const updateWebsiteCategory = async (domain: string, category: CategoryName) => {
    const updatedCustomCategories = {
      ...(data.settings.customCategories || {}),
      [domain]: category,
    };

    const domainStat = data.domains[domain];
    const updatedDomains = { ...data.domains };
    if (domainStat) {
      updatedDomains[domain] = { ...domainStat, category };
    }

    await saveStorageData({
      domains: updatedDomains,
      settings: {
        ...data.settings,
        customCategories: updatedCustomCategories,
      },
    });
    await refreshData();
  };

  const updateWebsiteProductivity = async (domain: string, type: ProductivityType) => {
    let customProductive = [...data.settings.customProductiveDomains];
    let customDistracting = [...data.settings.customDistractingDomains];

    if (type === 'productive') {
      if (!customProductive.includes(domain)) customProductive.push(domain);
      customDistracting = customDistracting.filter((d) => d !== domain);
    } else if (type === 'distracting') {
      if (!customDistracting.includes(domain)) customDistracting.push(domain);
      customProductive = customProductive.filter((d) => d !== domain);
    } else {
      customProductive = customProductive.filter((d) => d !== domain);
      customDistracting = customDistracting.filter((d) => d !== domain);
    }

    await updateSettings({
      customProductiveDomains: customProductive,
      customDistractingDomains: customDistracting,
    });
  };

  const resetData = async () => {
    await resetAllData();
    await refreshData();
  };

  const exportJSON = async () => {
    return await exportDataJSON();
  };

  const importJSON = async (jsonStr: string) => {
    const success = await importDataJSON(jsonStr);
    if (success) {
      await refreshData();
    }
    return success;
  };

  return (
    <StorageContext.Provider
      value={{
        domains: data.domains,
        daily: data.daily,
        settings: data.settings,
        isLoading,
        refreshData,
        updateSettings,
        updateWebsiteCategory,
        updateWebsiteProductivity,
        resetData,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used within a StorageProvider');
  return context;
};
